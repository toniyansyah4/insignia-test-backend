import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(name: string, email: string, balance?: number) {
    return this.prisma.user.create({
      data: {
        name: name,
        email: email,
        balance: balance,
      },
    });
  }

  async getUserBalance(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });
    return user?.balance;
  }

  async deposit(userId: number, amount: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount,
        },
        sentTransactions: {
          create: {
            value: amount,
            receiverId: userId,
          },
        },
      },
    });
  }

  async transfer(senderId: number, receiverId: number, amount: number) {
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });
    if (!sender || sender.balance < amount) {
      throw new Error('Insufficient balance');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        value: amount,
        senderId: senderId,
        receiverId: receiverId,
      },
    });

    const updateSender = this.prisma.user.update({
      where: { id: senderId },
      data: { balance: { decrement: amount } },
    });

    const updateReceiver = this.prisma.user.update({
      where: { id: receiverId },
      data: { balance: { increment: amount } },
    });

    await this.prisma.$transaction([updateSender, updateReceiver]);

    return transaction;
  }

  async getTopTransaction() {
    const maxTransaction = await this.prisma.transaction.aggregate({
      _max: {
        value: true,
        id: true,
        senderId: true,
      },
    });

    const Users = await this.prisma.user.findMany({
      where: { id: maxTransaction._max.senderId },
      select: {
        name: true,
        balance: true,
      },
    });

    return Users;
  }

  async getTopTransactingUsers() {
    const maxTransaction = await this.prisma.transaction.aggregate({
      _max: {
        value: true,
        id: true,
        senderId: true,
      },
    });

    const Users = await this.prisma.user.findMany({
      where: { id: maxTransaction._max.senderId },
      select: {
        name: true,
        sentTransactions: { select: { value: true } },
      },
    });

    return Users;
  }
}
