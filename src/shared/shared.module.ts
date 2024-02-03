import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Device, DeviceSchema } from 'src/sessions/entities/device.type';

import { SharedService } from './shared.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }])],
  providers: [SharedService],
  exports: [SharedService]
})
export class SharedModule {}
