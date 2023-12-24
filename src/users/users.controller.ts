import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('balance') balance: number,
  ) {
    return this.usersService.createUser(name, email, password, balance);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') userId: string) {
    return this.usersService.getUserBalance(Number(userId));
  }

  @Post(':id/deposit')
  async deposit(@Param('id') userId: string, @Body('amount') amount: number) {
    return this.usersService.deposit(Number(userId), amount);
  }

  @Post(':id/transfer')
  async transfer(
    @Param('id') senderId: string,
    @Body('receiverId') receiverId: number,
    @Body('amount') amount: number,
  ) {
    return this.usersService.transfer(Number(senderId), receiverId, amount);
  }

  @Get('top-transaction')
  async getTopTransaction() {
    return this.usersService.getTopTransaction();
  }

  @Get('top-transacting-users')
  async getTopTransactingUsers() {
    return this.usersService.getTopTransactingUsers();
  }

  @Get('transactions')
  async getTransactions(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.usersService.getTransactions(page, limit);
  }
}
