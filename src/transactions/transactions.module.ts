import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Fund, FundSchema } from '../financial-assets/schemas/fund.schema';
import { Portfolio, PortfolioSchema } from '../portfolio/schemas/portfolio.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Fund.name, schema: FundSchema },
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: Transaction.name, schema: TransactionSchema }
    ])
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService]
})
export class TransactionsModule {}