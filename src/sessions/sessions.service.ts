import { Injectable } from '@nestjs/common';

import { Prisma, Session } from '@prisma/client';

import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async session(sessionWhereUniqueInput: Prisma.SessionWhereUniqueInput): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: sessionWhereUniqueInput
    });
  }

  async sessions(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SessionWhereUniqueInput;
    where?: Prisma.SessionWhereInput;
    orderBy?: Prisma.SessionOrderByWithRelationInput;
  }): Promise<Session[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.session.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy
    });
  }

  async createSession(data: Prisma.SessionCreateInput): Promise<Session> {
    return this.prisma.session.create({
      data
    });
  }

  async updateSession(params: {
    where: Prisma.SessionWhereUniqueInput;
    data: Prisma.SessionUpdateInput;
  }): Promise<Session> {
    const { data, where } = params;
    return this.prisma.session.update({
      data,
      where
    });
  }

  async deleteSession(where: Prisma.SessionWhereUniqueInput): Promise<Session> {
    return this.prisma.session.delete({
      where
    });
  }
}
