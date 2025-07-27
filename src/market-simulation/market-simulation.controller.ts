// ------------------------------------------------------------------------------------ 
 // backend/src/market-simulation/market-simulation.controller.ts 
 // ------------------------------------------------------------------------------------ 
 import { Controller, Post, Body, Param, Get } from '@nestjs/common'; 
 import { MarketSimulationService } from './market-simulation.service'; 
 import { FundDocument } from '../financial-assets/schemas/fund.schema'; 
 
 @Controller('api/market') 
 export class MarketController { 
   constructor(private readonly marketSimulationService: MarketSimulationService) {} 
 
   @Get('funds') 
   async getAllFunds(): Promise<FundDocument[]> { 
     return this.marketSimulationService.findAllFunds(); 
   } 
 
   @Post('admin/fund/:id/set-change') 
   async setFundChange(@Param('id') fundId: string, @Body('changePercentage') changePercentage: number) { 
     await this.marketSimulationService.setFundDailyChange(fundId, changePercentage); 
     return { message: `基金 ${fundId} 的涨跌幅已手动设置为 ${changePercentage}%` }; 
   } 
 }