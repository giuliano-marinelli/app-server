import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PolyAES } from 'poly-crypto';

@Injectable()
export class SharedService {
  constructor(private configService: ConfigService) {}

  encryptDevice(device: any): string {
    return PolyAES.withKey(this.configService.get<string>('SECRET_TOKEN')).encrypt(JSON.stringify(device));
  }

  decryptDevice(encryptedDevice: string): any {
    return JSON.parse(PolyAES.withKey(this.configService.get<string>('SECRET_TOKEN')).decrypt(encryptedDevice));
  }

  formatDevice(detectedDevice: any, ip: string): any {
    return {
      client: detectedDevice.client?.name,
      os: detectedDevice.os?.name,
      brand: detectedDevice.device?.brand,
      model: detectedDevice.device?.model,
      type: detectedDevice.device?.type,
      ip: ip
    };
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

    if (!selections) return [];

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
  // operations are ignored: eq, ne, gt, gte, lt, lte, like, ilike, in, any, between, and, or, not
  // example: [{"username": {"and": [{"eq": null,"ne": null},{"in": ["asd","asd2"]}]},"profile": {"name": { "eq": "qwe"}}},{"role": {"or": [{"eq": "user"},{"eq": "guest"}]}}]
  // filterFields = ['username', 'profile.name', 'role']
  // example 2: { username: { eq: 'asd' }, profile: { name: { eq: 'qwe' } }, role: { or: [{ eq: 'user' }, { eq: 'guest' }] } }
  // filterFields = ['username', 'profile.name', 'role']
  getFilterFieldsAsString(filter: any = {}): string[] {
    const fields: string[] = [];

    if (!filter) return [];

    if (Array.isArray(filter)) {
      filter.forEach((subfilter) => {
        fields.push(...this.getFilterFieldsAsString(subfilter));
      });
    } else if (typeof filter == 'object') {
      Object.keys(filter)?.forEach((field) => {
        if (
          field != 'eq' &&
          field != 'ne' &&
          field != 'gt' &&
          field != 'gte' &&
          field != 'lt' &&
          field != 'lte' &&
          field != 'like' &&
          field != 'ilike' &&
          field != 'in' &&
          field != 'any' &&
          field != 'between' &&
          field != 'and' &&
          field != 'or' &&
          field != 'not'
        ) {
          let subfields;
          if (typeof filter[field] == 'object')
            subfields = this.getFilterFieldsAsString(filter[field]).map((subfield) => `${field}.${subfield}`);

          if (!subfields?.length) fields.push(field);
          else fields.push(...subfields);
        } else {
          if (typeof filter[field] == 'object') {
            fields.push(...this.getFilterFieldsAsString(filter[field]));
          }
        }
      });
    }

    return fields;
  }

  // convert fields object with sub objects in a one level fields object
  // example: { _id: '65b41de0c641815f7ff5efdf', profile: { bio: 'something', phone: { number: 123456, area: 299} } }
  // oneLevelFields = { _id: '65b41de0c641815f7ff5efdf', 'profile.bio': 'something', 'profile.phone.number': 123456, 'profile.phone.area': 299 }
  getOneLevelFields(fields: any = {}): any {
    const oneLevelFields: any = {};

    if (!fields) return {};

    Object.keys(fields)?.forEach((field) => {
      if (typeof fields[field] == 'object') {
        const subfields = this.getOneLevelFields(fields[field]);
        Object.keys(subfields)?.forEach((subfield) => {
          oneLevelFields[`${field}.${subfield}`] = subfields[subfield];
        });
      } else {
        oneLevelFields[field] = fields[field];
      }
    });

    return oneLevelFields;
  }
}
