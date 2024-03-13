import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { SelectionInput } from '@nestjs!/graphql-filter';

import * as bcrypt from 'bcryptjs';
import * as DeviceDetector from 'device-detector-js';
import { GraphQLError, GraphQLErrorOptions } from 'graphql';
import { Repository } from 'typeorm';

import { Session } from 'src/sessions/entities/session.entity';
import { Role, User } from 'src/users/entities/user.entity';

import { SharedService } from 'src/shared/shared.service';

@Injectable()
export class AuthService {
  private errorMessage: string = 'Failed authentication: ';
  private errorOptions: GraphQLErrorOptions = { extensions: { code: 'UNAUTHORIZED' } };

  constructor(
    private jwtService: JwtService,
    private sharedService: SharedService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>
  ) {}

  async login(usernameOrEmail: string, password: string, context: any) {
    // find user by username or verified email
    const user = await this.usersRepository.findOne({
      where: [{ emails: { address: usernameOrEmail, verified: true } }, { username: usernameOrEmail }]
    });
    if (!user) throw new UnauthorizedException('There is no username or verified email that match.');

    //compare provided password with stored encrypted one
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Password is incorrect.');
    }

    // detect the device from request header user-agent
    const deviceDetector = new DeviceDetector();
    const detectedDevice = deviceDetector.parse(context.req.headers['user-agent']);

    if (!detectedDevice) throw new UnauthorizedException('Device not detected.');

    // format device to use only the necessary information
    const device = this.sharedService.formatDevice(detectedDevice, context.req.ip);

    // create jwt token with user id and encrypted device
    let token = await this.jwtService.signAsync({
      id: user.id,
      device: this.sharedService.encryptDevice(device)
    });

    // try to find an existing session for the user and the detected device
    const session = await this.sessionsRepository.findOne({
      relations: {
        user: true
      },
      where: { user: { id: user.id }, blockedAt: null, device: device }
    });

    //if there are no session with same device, create new session
    //else, update their token
    if (!session) {
      await this.sessionsRepository.insert({
        user: user,
        token: token,
        device: device,
        lastActivity: new Date()
      });
    } else {
      if (!session.closedAt) token = session.token;
      await this.sessionsRepository.update(
        { id: session.id },
        {
          token: token,
          blockedAt: null,
          closedAt: null
        }
      );
    }

    return token;
  }

  async logout(context: any) {
    const token = this.sharedService.extractTokenFromHeader(context.req);

    const session = await this.sessionsRepository.findOneBy({ token: token });
    if (!session) throw new GraphQLError(this.errorMessage + 'session not found', this.errorOptions);

    await this.sessionsRepository.update({ token: token }, { closedAt: new Date() });

    return true;
  }

  async resetPassword(code: string, newPassword: string, selection: SelectionInput) {
    // check if code is expired (with jwt)
    if (code) {
      try {
        await this.jwtService.verifyAsync(code);
      } catch (error) {
        throw new UnauthorizedException('Password code is expired.');
      }
    }

    // find user by password code
    const user = await this.usersRepository.findOne({
      where: { passwordCode: code }
    });
    if (!user) throw new UnauthorizedException('Password code is invalid.');

    // hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // update user password and remove password code
    await this.usersRepository.update({ id: user.id }, { password: hashedPassword, passwordCode: null });

    return await this.usersRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: user.id }
    });
  }

  async updatePasswordCode(usernameOrEmail: string, selection: SelectionInput) {
    // find user by username or verified email
    const user = await this.usersRepository.findOne({
      where: [{ emails: { address: usernameOrEmail, verified: true } }, { username: usernameOrEmail }]
    });
    if (!user) throw new UnauthorizedException('There is no username or verified email that match.');

    // if code exists decrypt it for check if it's expired (with jwt)
    if (user.passwordCode) {
      try {
        await this.jwtService.verifyAsync(user.passwordCode);
      } catch (error) {
        // if it's expired, generate a new one that expires in 4 minutes
        user.passwordCode = await this.jwtService.signAsync({ id: user.id }, { expiresIn: '240s' });
      }
    } else {
      // if it does not exist, generate a new one that expires in 4 minutes
      user.passwordCode = await this.jwtService.signAsync({ id: user.id }, { expiresIn: '240s' });
    }

    await this.usersRepository.update({ id: user.id }, { passwordCode: user.passwordCode });

    // TODO: send email with password code to primary email

    return await this.usersRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: user.id }
    });
  }

  async updateVerificationCode(id: string, selection: SelectionInput, authUser: User) {
    // only admin can update other users
    if (id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot update password of users other than yourself.');

    // check if user exists
    const existent = await this.usersRepository.findOne({
      where: { id: id }
    });
    if (!existent) throw new ConflictException('User not found.');

    // check if last verification try was less than 2 minutes ago
    // if (existent.lastVerificationTry && new Date().getTime() - existent.lastVerificationTry.getTime() < minutes(2))
    //   throw new ConflictException(
    //     'Need to wait ' +
    //       ((new Date().getTime() - existent.lastVerificationTry.getTime()) / 1000).toFixed() +
    //       ' seconds to send email again.'
    //   );

    // generate a 6 characters long alphanumeric code if it does not exist
    const code = existent.verificationCode
      ? existent.verificationCode
      : Math.random().toString(36).substring(2, 8).toUpperCase();

    await this.usersRepository.update({ id: id }, { verificationCode: code, lastVerificationTry: new Date() });

    // TODO: send email with verification code to primary email

    return await this.usersRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: id }
    });
  }

  async checkVerificationCode(id: string, code: string, authUser: User) {
    // only admin can check verification code of other users
    if (id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot check verification code of users other than yourself.');

    // check if user exists
    const existent = await this.usersRepository.findOne({
      where: { id: id }
    });
    if (!existent) throw new ConflictException('User not found.');

    return existent.verificationCode == code;
  }
}
