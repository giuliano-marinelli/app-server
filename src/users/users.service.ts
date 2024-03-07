import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginationInput, SelectionInput } from '@nestjs!/graphql-filter';

import * as bcrypt from 'bcryptjs';
import { Equal, FindOptionsOrder, FindOptionsWhere, Not, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { Role, User, UserCreateInput, UserUpdateInput } from './entities/user.entity';
import { Session } from 'src/sessions/entities/session.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>
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

    // TODO: send email advising account was created

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

    // if username is being updated, notify
    if (userUpdateInput.username && userUpdateInput.username != existent.username) {
      // TODO: send email advising username changed
    }

    // if email is being updated, unverify user
    if (userUpdateInput.email && userUpdateInput.email != existent.email) {
      userUpdateInput.verified = false;
      userUpdateInput.verificationCode = null;
      userUpdateInput.lastVerificationTry = null;

      // TODO: send email advising email changed
    }

    await this.usersRepository.update({ id: userUpdateInput.id }, userUpdateInput);
    return await this.usersRepository.findOne({
      relations: selection?.getTypeORMRelations(),
      where: { id: userUpdateInput.id }
    });
  }

  async updatePassword(id: string, password: string, newPassword: string, selection: SelectionInput, authUser: User) {
    // only admin can update other users
    if (id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot update password of users other than yourself.');

    // check if user exists
    const existent = await this.usersRepository.findOne({
      where: { id: id }
    });
    if (!existent) throw new ConflictException('User not found');

    // check if old password is correct
    const passwordMatch = await bcrypt.compare(password, existent.password);
    if (!passwordMatch) throw new ConflictException('Password is incorrect.');

    // hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // TODO: send email advising password changed

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

  async delete(id: string, password: string, authUser: User) {
    // only admin can delete other users
    if (id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot delete users other than yourself.');

    // check if user exists
    const existent = await this.usersRepository.findOne({
      where: { id: id }
    });
    if (!existent) throw new ConflictException('User not found');

    // check if password is correct
    const passwordMatch = await bcrypt.compare(password, existent.password);
    if (!passwordMatch) throw new ConflictException('Password is incorrect.');

    // close all sessions of the user
    this.sessionsRepository.update({ user: { id: id } }, { closedAt: new Date() });

    // TODO: send email advising account was deleted

    await this.usersRepository.softDelete({ id: id });
    return id;
  }

  async checkPassword(id: string, password: string, authUser: User) {
    // only admin can check password of other users
    if (id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot check password of users other than yourself.');

    // check if user exists
    const existent = await this.usersRepository.findOne({
      where: { id: id }
    });
    if (!existent) throw new ConflictException('User not found');

    return await bcrypt.compare(password, existent.password);
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
    const [set, count] = await this.usersRepository.findAndCount({
      relations: selection?.getTypeORMRelations(),
      where: where,
      order: order,
      skip: pagination ? (pagination.page - 1) * pagination.count : null,
      take: pagination ? pagination.count : null
    });
    return { set, count };
  }
}
