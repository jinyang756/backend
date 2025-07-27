// ------------------------------------------------------------------------------------ 
 // backend/src/portfolio/portfolio.controller.ts 
 // ------------------------------------------------------------------------------------ 
 import { Controller, Get, Param } from '@nestjs/common'; 
 import { PortfolioService } from './portfolio.service'; 
 import { PortfolioDocument } from './schemas/portfolio.schema'; 
 
 @Controller('api/portfolio') 
 export class PortfolioController { 
   constructor(private readonly portfolioService: PortfolioService) {} 
 
   @Get(':userId/holdings') 
   async getHoldings(@Param('userId') userId: string): Promise<PortfolioDocument[]> { 
     return this.portfolioService.findUserHoldings(userId); 
   } 
 }