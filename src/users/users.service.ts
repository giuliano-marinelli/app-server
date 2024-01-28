import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as bcrypt from 'bcryptjs';
import { Model, Schema as MongooseSchema } from 'mongoose';

import { CreateUserInput, UpdateUserInput, User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async create(createUserInput: CreateUserInput) {
    // check if username or email are already taken
    const existent = await this.userModel.findOne({
      $or: [{ username: createUserInput.username }, { email: createUserInput.email }]
    });
    if (existent) throw new ConflictException('Email or username are already taken.');

    // add authorization and informative parameters
    const newUser = new this.userModel(createUserInput);

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);
    newUser.password = hashedPassword;

    return await this.userModel.create(newUser);
  }

  async findAll(options: { search?: string; filter?: any; sort?: any; pagination?: any; optional?: boolean }) {
    // console.log('search', options.search);
    // console.log('filter', options.filter);
    // console.log('sort', options.sort);
    // console.log('pagination', options.pagination);
    // console.log('optional', options.optional);
    return await this.userModel.find();
  }

  async findOne(id: MongooseSchema.Types.ObjectId) {
    return await this.userModel.findById(id);
  }

  async update(id: MongooseSchema.Types.ObjectId, updateUserInput: UpdateUserInput) {
    return await this.userModel.findByIdAndUpdate(id, updateUserInput, { new: true });
  }

  async remove(id: MongooseSchema.Types.ObjectId) {
    return await this.userModel.findByIdAndDelete(id);
  }
}
