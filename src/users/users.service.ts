import { ConflictException, Injectable } from '@nestjs/common';

import { Prisma, User } from '@prisma/client';

import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    // // check if username or email are already taken
    // const existent = await this.userModel.findOne({
    //   $or: [{ username: createUserInput.username }, { email: createUserInput.email }]
    // });
    // if (existent) throw new ConflictException('Email or username are already taken.');

    // // add authorization and informative parameters
    // const newUser = new this.userModel(createUserInput);

    // // hash password
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newUser.password, salt);
    // newUser.password = hashedPassword;

    // return await this.userModel.create(newUser);

    return this.prisma.user.create({
      data
    });
  }

  async updateUser(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<User> {
    const { data, where } = params;
    return this.prisma.user.update({
      data,
      where
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where
    });
  }
}
