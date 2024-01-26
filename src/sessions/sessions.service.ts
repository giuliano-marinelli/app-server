import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Schema as MongooseSchema } from 'mongoose';

import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(@InjectModel(Session.name) private readonly sessionModel: Model<Session>) {}

  async findAll(options: { search?: string; filter?: any; sort?: any; pagination?: any; optional?: boolean }) {
    console.log('search', options.search);
    console.log('filter', options.filter);
    console.log('sort', options.sort);
    console.log('pagination', options.pagination);
    console.log('optional', options.optional);
    return await this.sessionModel.find();
  }

  async findOne(id: MongooseSchema.Types.ObjectId) {
    return await this.sessionModel.findById(id);
  }
}
