import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcryptjs';
import * as DeviceDetector from 'device-detector-js';
import { Repository } from 'typeorm';

import { Session } from 'src/sessions/entities/session.entity';
import { User } from 'src/users/entities/user.entity';

import { SharedService } from 'src/common/shared/shared.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private sharedService: SharedService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>
  ) {}

  async login(usernameOrEmail: string, password: string, context: any) {
    const user = await this.usersRepository.findOne({
      where: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });
    if (!user) {
      throw new UnauthorizedException('Email or username are not registered.');
    }

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
}
