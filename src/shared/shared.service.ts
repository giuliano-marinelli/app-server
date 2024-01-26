import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { PolyAES } from 'poly-crypto';

import { Device } from 'src/sessions/entities/device.entity';

@Injectable()
export class SharedService {
  constructor(
    private configService: ConfigService,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>
  ) {}

  encryptDevice(device: any): string {
    return PolyAES.withKey(this.configService.get<string>('SECRET_TOKEN')).encrypt(JSON.stringify(device));
  }

  decryptDevice(encryptedDevice: string): any {
    return JSON.parse(PolyAES.withKey(this.configService.get<string>('SECRET_TOKEN')).decrypt(encryptedDevice));
  }

  formatDevice(detectedDevice: any, ip: string): any {
    return new this.deviceModel({
      client: detectedDevice.client?.name,
      os: detectedDevice.os?.name,
      brand: detectedDevice.device?.brand,
      model: detectedDevice.device?.model,
      type: detectedDevice.device?.type,
      ip: ip
    });
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  getQuerySelectionsSet(selections: readonly any[]): any {
    const fields: any = {};

    for (const selection of selections) {
      if (selection.kind === 'Field') {
        fields[selection.name.value] = {};
      }

      if (selection.selectionSet) {
        fields[selection.name.value] = this.getQuerySelectionsSet(selection.selectionSet.selections);
      }
    }

    return fields;
  }

  // convert selections set object to array of string fields
  // sub selections set are showed as parent.child
  // example: user { name, email, sessions { _id, ip } }
  // selectionsSet = ['name', 'email', 'sessions._id', 'sessions.ip']
  getQuerySelectionsSetAsString(selections: readonly any[]): string[] {
    const fields: string[] = [];

    for (const selection of selections) {
      if (selection.kind === 'Field') {
        if (selection.selectionSet) {
          fields.push(
            ...this.getQuerySelectionsSetAsString(selection.selectionSet.selections).map(
              (field) => `${selection.name.value}.${field}`
            )
          );
        } else {
          fields.push(selection.name.value);
        }
      }
    }

    return fields;
  }

  // convert filter object to array of string fields
  // sub filter fields are showed as parent.child
  // example: { _id: { eq: '123' }, user: { _id: { eq: '456' } } }
  // filterFields = ['_id', 'user._id']
  getFilterFieldsAsString(filter: any = {}): string[] {
    const fields: string[] = [];

    Object.keys(filter)?.forEach((field) => {
      if (
        filter[field]?.eq ||
        filter[field]?.ne ||
        filter[field]?.gt ||
        filter[field]?.gte ||
        filter[field]?.lt ||
        filter[field]?.lte ||
        filter[field]?.like
      ) {
        fields.push(field);
      } else {
        fields.push(...this.getFilterFieldsAsString(filter[field]).map((subfield) => `${field}.${subfield}`));
      }
    });

    return fields;
  }
}
