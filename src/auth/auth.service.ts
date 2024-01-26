import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import * as bcrypt from 'bcryptjs';
import * as DeviceDetector from 'device-detector-js';
import { Model } from 'mongoose';

import { Device } from 'src/sessions/entities/device.entity';
import { Session } from 'src/sessions/entities/session.entity';
import { User } from 'src/users/entities/user.entity';

import { SharedService } from 'src/shared/shared.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private sharedService: SharedService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>
  ) {}

  async login(usernameOrEmail: string, password: string, context: any) {
    const user = await this.userModel.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
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
      id: user._id,
      device: this.sharedService.encryptDevice(device)
    });

    // try to find an existing session for the user and the detected device
    const session = await this.sessionModel.findOne({
      $and: [{ user: user._id }, { blocked: false }, { device: device }]
    });

    //if there are no session with same device, create new session
    //else, update their token
    if (!session) {
      await this.sessionModel.create({
        user: user._id,
        token: token,
        device: device,
        blocked: false,
        closed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      if (!session.closed) token = session.token;
      await this.sessionModel.updateOne(
        { _id: session._id },
        {
          $set: {
            token: token,
            blocked: false,
            closed: false,
            updatedAt: new Date()
          }
        }
      );
    }

    return token;
  }
}
