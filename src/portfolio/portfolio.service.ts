// ------------------------------------------------------------------------------------ 
 // backend/src/portfolio/portfolio.service.ts (新增的 PortfolioService) 
 // ------------------------------------------------------------------------------------ 
 import { Injectable } from '@nestjs/common'; 
 import { InjectModel } from '@nestjs/mongoose'; 
 import { Model } from 'mongoose'; 
 import { Portfolio, PortfolioDocument } from './schemas/portfolio.schema'; 
 
 @Injectable() 
 export class PortfolioService { 
   constructor(@InjectModel(Portfolio.name) private portfolioModel: Model<PortfolioDocument>) {} 
 
   async findUserHoldings(userId: string): Promise<PortfolioDocument[]> { 
     // populate 'fundId' to get fund details along with portfolio item 
     return this.portfolioModel.find({ userId }).populate('fundId').exec(); 
   } 
 }