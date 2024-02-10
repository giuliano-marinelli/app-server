import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcryptjs';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';

import { CreateUserInput, UpdateUserInput, User } from './entities/user.entity';

import { PaginationInput } from 'src/common/search/pagination.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserInput: CreateUserInput) {
    // check if username or email are already taken
    const existent = await this.usersRepository.findOne({
      where: [{ username: createUserInput.username }, { email: createUserInput.email }]
    });
    if (existent) throw new ConflictException('Email or username are already taken.');

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserInput.password, salt);
    createUserInput.password = hashedPassword;

    const insert = await this.usersRepository.insert(createUserInput);
    return await this.usersRepository.findOneBy({ id: insert.identifiers[0].id });
  }

  async update(updateUserInput: UpdateUserInput) {
    await this.usersRepository.update({ id: updateUserInput.id }, updateUserInput);
    return await this.usersRepository.findOneBy({ id: updateUserInput.id });
  }

  async delete(id: string) {
    await this.usersRepository.softDelete({ id: id });
    return id;
  }

  async findOne(id: string) {
    return await this.usersRepository.findOne({
      relations: { sessions: true },
      where: { id: id }
    });
  }

  async findAll(options: {
    where?: FindOptionsWhere<User>;
    order?: FindOptionsOrder<User>;
    pagination?: PaginationInput;
  }) {
    return await this.usersRepository.find({
      relations: { sessions: true },
      where: options.where,
      order: options.order,
      skip: options.pagination ? (options.pagination?.page - 1) * options.pagination?.count : null,
      take: options.pagination ? options.pagination?.count : null
    });
  }
}
