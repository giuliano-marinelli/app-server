import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginationInput, SelectionInput } from '@nestjs!/graphql-filter';

import * as bcrypt from 'bcryptjs';
import { Equal, FindOptionsOrder, FindOptionsWhere, Not, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { Role, User, UserCreateInput, UserUpdateInput } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(userCreateInput: UserCreateInput, selection: SelectionInput) {
    // check if username already taken
    const existentUsername = await this.usersRepository.findOne({
      where: { username: userCreateInput.username }
    });
    if (existentUsername) throw new ConflictException('Username already taken.');

    // check if email already taken
    const existentEmail = await this.usersRepository.findOne({
      where: { email: userCreateInput.email }
    });
    if (existentEmail) throw new ConflictException('Email already taken.');

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userCreateInput.password, salt);
    userCreateInput.password = hashedPassword;

    const insert = await this.usersRepository.insert(userCreateInput);
    return await this.usersRepository.findOne({
      relations: selection?.getTypeORMRelations(),
      where: { id: insert.identifiers[0].id }
    });
  }

  async update(userUpdateInput: UserUpdateInput, selection: SelectionInput, authUser: User) {
    // only admin can update other users
    if (userUpdateInput.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot update users other than yourself.');

    // check if user exists
    const existent = await this.usersRepository.findOne({
      where: { id: userUpdateInput.id }
    });
    if (!existent) throw new ConflictException('User not found');

    // check if username already taken
    if (userUpdateInput.username) {
      const existentUsername = await this.usersRepository.findOne({
        where: [{ id: Not(Equal(userUpdateInput.id)), username: userUpdateInput.username }]
      });
      if (existentUsername) throw new ConflictException('Username already taken.');
    }

    // check if email already taken
    if (userUpdateInput.email) {
      const existentEmail = await this.usersRepository.findOne({
        where: [{ id: Not(Equal(userUpdateInput.id)), email: userUpdateInput.email }]
      });
      if (existentEmail) throw new ConflictException('Email already taken.');
    }

    // if email is being updated, unverify user
    if (userUpdateInput.email && userUpdateInput.email != existent.email) {
      userUpdateInput.verified = false;
      userUpdateInput.verificationCode = null;
      userUpdateInput.lastVerificationTry = null;
    }

    await this.usersRepository.update({ id: userUpdateInput.id }, userUpdateInput);
    return await this.usersRepository.findOne({
      relations: selection?.getTypeORMRelations(),
      where: { id: userUpdateInput.id }
    });
  }

  async updatePassword(id: string, password: string, selection: SelectionInput, authUser: User) {
    // only admin can update other users
    if (id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot update password of users other than yourself.');

    // check if user exists
    const existent = await this.usersRepository.findOne({
      where: { id: id }
    });
    if (!existent) throw new ConflictException('User not found');

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.usersRepository.update({ id: id }, { password: hashedPassword });
    return await this.usersRepository.findOne({
      relations: selection?.getTypeORMRelations(),
      where: { id: id }
    });
  }

  async updateVerificationCode(id: string, selection: SelectionInput, authUser: User) {
    // only admin can update other users
    if (id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot get verification code of users other than yourself.');

    // check if user exists
    const existent = await this.usersRepository.findOne({
      where: { id: id }
    });
    if (!existent) throw new ConflictException('User not found');

    // check if email is already verified
    if (existent.verified) throw new ConflictException('Email is already verified.');

    await this.usersRepository.update({ id: id }, { lastVerificationTry: new Date(), verificationCode: uuid() });

    // TODO: send email with verification code

    return await this.usersRepository.findOne({
      relations: selection?.getTypeORMRelations(),
      where: { id: id }
    });
  }

  async verify(id: string, code: string, selection: SelectionInput, authUser: User) {
    // only admin can update other users
    if (id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot verify users other than yourself.');

    // check if user exists
    const existent = await this.usersRepository.findOne({
      where: { id: id }
    });
    if (!existent) throw new ConflictException('User not found');

    // check if email is already verified
    if (existent.verified) throw new ConflictException('Email is already verified.');

    // check if code is correct
    if (existent.verificationCode != code) throw new ConflictException('Invalid verification code.');

    await this.usersRepository.update({ id: id }, { verified: true });

    // TODO: send email advising account email was verified

    return await this.usersRepository.findOne({
      relations: selection?.getTypeORMRelations(),
      where: { id: id }
    });
  }

  async delete(id: string, authUser: User) {
    // only admin can delete other users
    if (id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot delete users other than yourself.');

    await this.usersRepository.softDelete({ id: id });
    return id;
  }

  async findOne(id: string, selection: SelectionInput) {
    return await this.usersRepository.findOne({
      relations: selection?.getTypeORMRelations(),
      where: { id: id }
    });
  }

  async findMany(
    where: FindOptionsWhere<User>,
    order: FindOptionsOrder<User>,
    pagination: PaginationInput,
    selection: SelectionInput
  ) {
    return await this.usersRepository.find({
      relations: selection?.getTypeORMRelations(),
      where: where,
      order: order,
      skip: pagination ? (pagination.page - 1) * pagination.count : null,
      take: pagination ? pagination.count : null
    });
  }
}
