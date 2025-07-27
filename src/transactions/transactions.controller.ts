// ------------------------------------------------------------------------------------ 
 // backend/src/transactions/transactions.controller.ts 
 // ------------------------------------------------------------------------------------ 
 import { Controller, Post, Body, Param, Get } from '@nestjs/common'; 
 import { TransactionsService } from './transactions.service'; 
 import { UserDocument } from '../users/schemas/user.schema'; 
 import { TransactionDocument } from './schemas/transaction.schema'; 
 
 @Controller('api/transactions') 
 export class TransactionsController { 
   constructor(private readonly transactionsService: TransactionsService) {} 
 
   @Post(':userId/deposit') 
   async deposit(@Param('userId') userId: string, @Body('amount') amount: number): Promise<UserDocument> { 
     return this.transactionsService.fundAccount(userId, amount, 'deposit'); 
   } 
 
   @Post(':userId/purchase') 
   async purchase(@Param('userId') userId: string, @Body('fundId') fundId: string, @Body('amount') amount: number): Promise<TransactionDocument> { 
     return this.transactionsService.purchaseFund(userId, fundId, amount); 
   } 
 
   @Post(':userId/redeem') 
   async redeem(@Param('userId') userId: string, @Body('fundId') fundId: string, @Body('shares') shares: number): Promise<TransactionDocument> { 
     return this.transactionsService.redeemFund(userId, fundId, shares); 
   } 
 }