import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { GraphQLError, GraphQLErrorOptions } from 'graphql';
import * as _ from 'lodash';
import { Repository } from 'typeorm';
import * as validateUUID from 'uuid-validate';

import { IS_PUBLIC_KEY } from './decorators/public.decorator';

import { Session } from 'src/sessions/entities/session.entity';
import { User } from 'src/users/entities/user.entity';

import { SharedService } from 'src/shared/shared.service';

import DeviceDetector = require('device-detector-js');

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private sharedService: SharedService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>
  ) {}

  private errorMessage: string = 'Failed authentication: ';
  private errorOptions: GraphQLErrorOptions = { extensions: { code: 'UNAUTHORIZED' } };

  async canActivate(execContext: ExecutionContext): Promise<boolean> {
    const context = GqlExecutionContext.create(execContext);

    const info = context.getInfo();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // in case that the controller route is not public we check the jwt token
    // get the token from the request header authorization
    const request = context.getContext().req;
    const token = this.sharedService.extractTokenFromHeader(request);

    // if the controller route is marked as public and there's no provided token, we allow access but without user information
    // this allow us to change the behavior of the route if the user is authenticated or not in the casl policies
    if (!token && isPublic) {
      console.info('\x1b[42m ' + info.fieldName + ' \x1b[0m', '\x1b[36mPUBLIC\x1b[0m');
      return true;
    }

    if (!token) throw new GraphQLError(this.errorMessage + 'authorization not found', this.errorOptions);

    // verify jwt token is valid
    let decodedToken: any;
    try {
      decodedToken = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('SECRET_TOKEN')
      });
    } catch (error) {
      throw new GraphQLError(this.errorMessage + 'parsing token error', this.errorOptions);
    }

    // check if token has user id and device
    if (!decodedToken?.id || !decodedToken?.device || !validateUUID(decodedToken?.id))
      throw new GraphQLError(this.errorMessage + 'invalid token', this.errorOptions);

    // find user with token user id
    const user = await this.usersRepository.findOne({
      relations: { profile: true, emails: true },
      where: { id: decodedToken.id }
    });
    if (!user) throw new GraphQLError(this.errorMessage + 'user not found', this.errorOptions);

    // find session with same token
    const session = await this.sessionsRepository.findOneBy({ token: token });
    if (!session) throw new GraphQLError(this.errorMessage + 'session not found', this.errorOptions);
    if (session.closedAt) throw new GraphQLError(this.errorMessage + 'session is closed', this.errorOptions);
    if (session.blockedAt) throw new GraphQLError(this.errorMessage + 'session is blocked', this.errorOptions);

    // detect the device from request header user-agent
    const deviceDetector = new DeviceDetector();
    const detectedDevice = this.sharedService.formatDevice(
      deviceDetector.parse(request.headers['user-agent']),
      request.ip
    );

    // decrypt the device from jwt token
    const decryptedDevice = this.sharedService.decryptDevice(decodedToken.device);

    // here we check detected device is equal to the device in jwt token
    // if it's not equal we block the session
    if (JSON.stringify(detectedDevice) != JSON.stringify(decryptedDevice)) {
      await this.sessionsRepository.update({ token: token }, { blockedAt: new Date() });

      // HERE WE HAVE TO NOTIFY WITH EMAIL OR PUSH NOTIFICATION

      throw new GraphQLError(this.errorMessage + 'devices not match', this.errorOptions);
    }

    // update session last activity
    session.lastActivity = new Date();
    await this.sessionsRepository.save(session);

    // we're assigning the user to the request object here
    // so that we can access it in our route handlers
    request['user'] = user;

    // prettier-ignore
    console.info('\x1b[42m ' + info.fieldName + ' \x1b[0m', '\x1b[35m' + user?.username, '(', user?.role, ')', '[', user?.id, ']\x1b[0m');

    return true;
  }
}
