import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { minutes } from '@nestjs/throttler';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';

import { Owner, PaginationInput, SelectionInput } from '@nestjs!/graphql-filter';

import * as bcrypt from 'bcryptjs';
import { EntityManager, FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { Email, EmailCreateInput } from './entities/email.entity';
import { Role, User } from 'src/users/entities/user.entity';

@Injectable()
export class EmailsService {
  constructor(
    @InjectRepository(Email)
    private emailsRepository: Repository<Email>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectEntityManager()
    private entityManager: EntityManager
  ) {}

  async create(emailCreateInput: EmailCreateInput, selection: SelectionInput, authUser: User) {
    // only admin can create emails on other users
    if (emailCreateInput.user.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot create emails on users other than yourself.');

    // check if email already taken
    const existentVerified = await this.emailsRepository.findOne({
      where: { address: emailCreateInput.address, verified: true }
    });
    if (existentVerified) throw new ConflictException('Email already taken.');

    // check if email already added to user
    const existentNotVerified = await this.emailsRepository.findOne({
      where: { address: emailCreateInput.address, user: { id: emailCreateInput.user.id } }
    });
    if (existentNotVerified) throw new ConflictException('Email already added to user.');

    // check if user primary email is verified
    const verifiedUser = await this.usersRepository.findOne({
      where: { id: emailCreateInput.user.id, primaryEmail: { verified: true } }
    });
    if (!verifiedUser && authUser.role != Role.ADMIN)
      throw new ForbiddenException("Can't add alternative emails if user primary email is not verified.");

    const insert = await this.emailsRepository.insert({
      ...emailCreateInput,
      user: { id: emailCreateInput.user.id }
    });

    return await this.emailsRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: insert.identifiers[0].id }
    });
  }

  async updateVerificationCode(id: string, selection: SelectionInput, authUser: User) {
    // check if email exists
    const existent = await this.emailsRepository.findOne({
      relations: { user: true },
      where: { id: id }
    });
    if (!existent) throw new ConflictException('Email not found.');

    // only admin can update emails on other users
    if (existent.user?.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot update verification code of users other than yourself.');

    // check if email is already verified
    if (existent.verified) throw new ConflictException('Email is already verified.');

    // check if last verification try was less than 2 minutes ago
    // if (existent.lastVerificationTry && new Date().getTime() - existent.lastVerificationTry.getTime() < minutes(2))
    //   throw new ConflictException({
    //     message:
    //       'Need to wait ' +
    //       ((new Date().getTime() - existent.lastVerificationTry.getTime()) / 1000).toFixed() +
    //       ' seconds to send email again.',
    //   });

    // update verification code if it's doesn't exist
    await this.emailsRepository.update(
      { id: id },
      {
        verificationCode: existent.verificationCode ? existent.verificationCode : uuid(),
        lastVerificationTry: new Date()
      }
    );

    // TODO: send email with verification code

    return await this.emailsRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: id }
    });
  }

  async verify(id: string, code: string, selection: SelectionInput, authUser: User) {
    // check if email exists
    const existent = await this.emailsRepository.findOne({
      relations: { user: true },
      where: { id: id }
    });
    if (!existent) throw new ConflictException('Email not found.');

    // only admin can verify emails on other users
    if (existent.user?.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot verify emails of users other than yourself.');

    // check if email is already verified
    if (existent.verified) throw new ConflictException('Email is already verified.');

    // check if code is correct
    if (existent.verificationCode != code) throw new ConflictException('Invalid verification code.');

    // check if verification code is expired
    if (new Date().getTime() - existent.lastVerificationTry.getTime() > minutes(2))
      throw new ConflictException('Verification code expired.');

    // nullify verification code and set email as verified
    await this.emailsRepository.update(
      { id: id },
      { verified: true, verificationCode: null, lastVerificationTry: null }
    );

    // TODO: send email advising account email was verified

    return await this.emailsRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: id }
    });
  }

  async delete(id: string, password: string, code: string, authUser: User) {
    // check if email exists
    const existent = await this.emailsRepository.findOne({
      relations: { user: true },
      where: { id: id }
    });
    if (!existent) throw new ConflictException('Email not found.');

    // only admin can delete emails on other users
    if (existent.user?.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot delete emails of users other than yourself.');

    // check if email is not primary
    if (existent.user?.primaryEmail?.id == id) throw new ConflictException('Cannot delete primary email.');

    // check if password is correct
    const passwordMatch = await bcrypt.compare(password, existent.user?.password);
    if (!passwordMatch) throw new ConflictException('Password is incorrect.');

    // check if code is correct
    if (existent.user?.verificationCode != code) throw new ConflictException('Invalid verification code.');

    await this.entityManager.transaction(async (manager) => {
      const emailsRepository = manager.getRepository(Email);
      const usersRepository = manager.getRepository(User);

      // delete email
      await emailsRepository.softDelete({ id: id });

      // nullify verification code
      await usersRepository.update({ id: existent.user?.id }, { verificationCode: null, lastVerificationTry: null });
    });

    // TODO: send email advising email was deleted

    return id;
  }

  async checkAddressExists(address: string) {
    const [set, count] = await this.emailsRepository.findAndCount({
      where: { address: address, verified: true }
    });
    return count > 0;
  }

  async findOne(id: string, selection: SelectionInput, authUser: User) {
    return await this.emailsRepository.findOne({
      relations: selection?.getRelations(),
      where: Owner({ id: id }, 'user.id', authUser, [Role.ADMIN])
    });
  }

  async findMany(
    where: FindOptionsWhere<Email>,
    order: FindOptionsOrder<Email>,
    pagination: PaginationInput,
    selection: SelectionInput,
    authUser: User
  ) {
    const [set, count] = await this.emailsRepository.findAndCount({
      relations: selection?.getRelations(),
      where: Owner(where, 'user.id', authUser, [Role.ADMIN]),
      order: order,
      skip: pagination ? (pagination.page - 1) * pagination.count : null,
      take: pagination ? pagination.count : null
    });
    return { set, count };
  }
}
