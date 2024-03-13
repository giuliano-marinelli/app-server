import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { minutes } from '@nestjs/throttler';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';

import { PaginationInput, SelectionInput } from '@nestjs!/graphql-filter';

import * as bcrypt from 'bcryptjs';
import { EntityManager, Equal, FindOptionsOrder, FindOptionsWhere, Not, Repository } from 'typeorm';

import { Role, User, UserCreateInput, UserUpdateInput } from './entities/user.entity';
import { Email, EmailRefInput } from 'src/emails/entities/email.entity';
import { Session } from 'src/sessions/entities/session.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Email)
    private emailsRepository: Repository<Email>,
    @InjectEntityManager()
    private entityManager: EntityManager
  ) {}

  async create(userCreateInput: UserCreateInput, selection: SelectionInput) {
    // check if username already taken
    const existentUsername = await this.usersRepository.findOne({
      where: { username: userCreateInput.username }
    });
    if (existentUsername) throw new ConflictException('Username already taken.');

    // check if email already taken
    const existentEmail = await this.usersRepository.findOne({
      where: { emails: { address: userCreateInput.email, verified: true } }
    });
    if (existentEmail) throw new ConflictException('Email already taken.');

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userCreateInput.password, salt);
    userCreateInput.password = hashedPassword;

    let userInsert;

    // create user and add email
    await this.entityManager.transaction(async (manager) => {
      const usersRepository = manager.getRepository(User);
      const emailsRepository = manager.getRepository(Email);

      // create user
      userInsert = await usersRepository.insert(userCreateInput);

      // check if user was created
      if (userInsert?.identifiers[0]?.id) {
        // add email to user
        const emailInsert = await emailsRepository.insert({
          address: userCreateInput.email,
          user: { id: userInsert.identifiers[0].id }
        });

        // set email as primary and default public email
        if (emailInsert?.identifiers[0]?.id) {
          await usersRepository.update(
            { id: userInsert.identifiers[0].id },
            {
              primaryEmail: { id: emailInsert.identifiers[0].id },
              profile: { publicEmail: { id: emailInsert.identifiers[0].id } }
            }
          );
        }

        // TODO: send email advising account was created
      }
    });

    return await this.usersRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: userInsert.identifiers[0].id }
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
    if (!existent) throw new ConflictException('User not found.');

    // check if username already taken
    if (userUpdateInput.username) {
      const existentUsername = await this.usersRepository.findOne({
        where: [{ id: Not(Equal(userUpdateInput.id)), username: userUpdateInput.username }]
      });
      if (existentUsername) throw new ConflictException('Username already taken.');
    }

    // check if profile public email is of your own and is verified
    if (userUpdateInput.profile?.publicEmail?.id) {
      const existentEmail = await this.emailsRepository.findOne({
        where: {
          id: userUpdateInput.profile.publicEmail.id,
          user: { id: userUpdateInput.id },
          verified: true
        }
      });
      if (!existentEmail) throw new ConflictException('Public email not found or not verified.');
    }

    // if username is being updated, notify
    if (userUpdateInput.username && userUpdateInput.username != existent.username) {
      // TODO: send email advising username changed
    }

    await this.usersRepository.update({ id: userUpdateInput.id }, userUpdateInput);
    return await this.usersRepository.findOne({
      relations: selection?.getRelations(),
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
    if (!existent) throw new ConflictException('User not found.');

    // check if old password is correct
    const passwordMatch = await bcrypt.compare(password, existent.password);
    if (!passwordMatch) throw new ConflictException('Password is incorrect.');

    // hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // TODO: send email advising password changed

    await this.usersRepository.update({ id: id }, { password: hashedPassword });
    return await this.usersRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: id }
    });
  }

  async updatePrimaryEmail(
    id: string,
    password: string,
    code: string,
    email: EmailRefInput,
    selection: SelectionInput,
    authUser: User
  ) {
    // only admin can update other users
    if (id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot update primary email of users other than yourself.');

    // check if user exists and is owner of the email and email is verified
    const existent = await this.usersRepository.findOne({
      where: { id: id, emails: { id: email.id, verified: true } }
    });
    if (!existent) throw new ConflictException('User or verified email not found.');

    // check if password is correct
    const passwordMatch = await bcrypt.compare(password, existent.password);
    if (!passwordMatch) throw new ConflictException('Password is incorrect.');

    // check if code is correct
    if (existent.verificationCode != code) throw new ConflictException('Invalid verification code.');

    // check if verification code is expired
    if (new Date().getTime() - existent.lastVerificationTry.getTime() > minutes(2))
      throw new ConflictException('Verification code expired.');

    // TODO: send email advising primary email changed

    // nullify verification code and set new email as primary
    await this.usersRepository.update(
      { id: id },
      { primaryEmail: { id: email.id }, verificationCode: null, lastVerificationTry: null }
    );
    return await this.usersRepository.findOne({
      relations: selection?.getRelations(),
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
    if (!existent) throw new ConflictException('User not found.');

    // check if password is correct
    const passwordMatch = await bcrypt.compare(password, existent.password);
    if (!passwordMatch) throw new ConflictException('Password is incorrect.');

    // delete user and close all sessions
    await this.entityManager.transaction(async (manager) => {
      const usersRepository = manager.getRepository(User);
      const sessionsRepository = manager.getRepository(Session);

      // close all sessions of the user
      sessionsRepository.update({ user: { id: id } }, { closedAt: new Date() });

      // TODO: send email advising account was deleted

      await usersRepository.softDelete({ id: id });
    });

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
    if (!existent) throw new ConflictException('User not found.');

    return await bcrypt.compare(password, existent.password);
  }

  async checkUsernameExists(username: string) {
    const [set, count] = await this.usersRepository.findAndCount({
      where: { username: username }
    });
    return count > 0;
  }

  async findOne(id: string, selection: SelectionInput) {
    return await this.usersRepository.findOne({
      relations: selection?.getRelations(),
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
      relations: selection?.getRelations(),
      where: where,
      order: order,
      skip: pagination ? (pagination.page - 1) * pagination.count : null,
      take: pagination ? pagination.count : null
    });

    console.log('FindUsers', set);
    return { set, count };
  }
}
