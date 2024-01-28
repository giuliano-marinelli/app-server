import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import * as _ from 'lodash';
import { Model } from 'mongoose';

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
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>
  ) {}

  private errorMessage: string = 'Failed authentication: ';

  async canActivate(execContext: ExecutionContext): Promise<boolean> {
    const context = GqlExecutionContext.create(execContext);

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
      return true;
    }

    if (!token) throw new UnauthorizedException(this.errorMessage + 'authorization not found');

    // verify jwt token is valid
    const decodedToken = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('SECRET_TOKEN')
    });

    // check if token has user id and device
    if (!decodedToken?.id || !decodedToken?.device)
      throw new UnauthorizedException(this.errorMessage + 'invalid token');

    // find user with token user id
    const user = await this.userModel.findOne({ _id: decodedToken.id });
    if (!user) throw new UnauthorizedException(this.errorMessage + 'user not found');

    // find session with same token
    const session = await this.sessionModel.findOne({ token: token });
    if (!session) throw new UnauthorizedException(this.errorMessage + 'session not found');
    if (session.closed) throw new UnauthorizedException(this.errorMessage + 'session is closed');
    if (session.blocked) throw new UnauthorizedException(this.errorMessage + 'session is blocked');

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
      await this.sessionModel.updateMany({ token: token }, { blocked: true });

      // HERE WE HAVE TO NOTIFY WITH EMAIL OR PUSH NOTIFICATION

      throw new UnauthorizedException(this.errorMessage + 'devices not match');
    }

    // update session last activity
    session.updatedAt = new Date();
    await session.save();

    // we're assigning the user to the request object here
    // so that we can access it in our route handlers
    request['user'] = user;

    return true;
  }
}
