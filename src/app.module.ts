// ------------------------------------------------------------------------------------ 
 // backend/src/app.module.ts 
 // ------------------------------------------------------------------------------------ 
 import { Module } from '@nestjs/common'; 
 import { MongooseModule } from '@nestjs/mongoose'; 
 import { JwtModule } from '@nestjs/jwt'; 
 
 // 导入 Schemas 
 import { User, UserSchema } from './users/schemas/user.schema'; 
 import { Fund, FundSchema } from './financial-assets/schemas/fund.schema'; 
 import { Portfolio, PortfolioSchema } from './portfolio/schemas/portfolio.schema'; 
 import { Transaction, TransactionSchema } from './transactions/schemas/transaction.schema'; 
 import { DonationProject, DonationProjectSchema } from './donations/schemas/donation-project.schema'; 
 import { UserDonation, UserDonationSchema } from './donations/schemas/user-donation.schema'; 
 
 // 导入 Services 
 import { UsersService } from './users/users.service';
 import { AuthService } from './auth/auth.service'; 
 import { MarketSimulationService } from './market-simulation/market-simulation.service'; 
 import { TransactionsService } from './transactions/transactions.service'; 
 import { DonationsService } from './donations/donations.service'; 
 import { PortfolioService } from './portfolio/portfolio.service'; // 新增导入 
 
 // 导入 Controllers 
 import { MarketController } from './market-simulation/market-simulation.controller'; 
 import { TransactionsController } from './transactions/transactions.controller'; 
 import { PortfolioController } from './portfolio/portfolio.controller'; 
 import { DonationsController } from './donations/donations.controller'; 
 
 @Module({ 
   imports: [ 
     MongooseModule.forRoot('mongodb://localhost/jucai-platform'), // 替换为您的MongoDB连接字符串 
     MongooseModule.forFeature([ 
       { name: User.name, schema: UserSchema }, 
       { name: Fund.name, schema: FundSchema }, 
       { name: Portfolio.name, schema: PortfolioSchema }, 
       { name: Transaction.name, schema: TransactionSchema }, 
       { name: DonationProject.name, schema: DonationProjectSchema }, 
       { name: UserDonation.name, schema: UserDonationSchema }, 
     ]), 
     JwtModule.register({ 
       secret: 'YOUR_SECRET_KEY', // 替换为安全的密钥 
       signOptions: { expiresIn: '60s' }, 
     }), 
   ], 
   controllers: [ 
     MarketController, 
     TransactionsController, 
     PortfolioController, 
     DonationsController, 
   ], 
   providers: [ 
     UsersService, 
     AuthService, 
     MarketSimulationService, 
     TransactionsService, 
     DonationsService, 
     PortfolioService, // 新增提供者 
   ], 
 }) 
 export class AppModule {}
