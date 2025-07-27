// ------------------------------------------------------------------------------------ 
 // backend/src/market-simulation/market-simulation.service.ts 
 // ------------------------------------------------------------------------------------ 
 import { Injectable, Logger } from '@nestjs/common'; 
 import { InjectModel } from '@nestjs/mongoose'; 
 import { Model } from 'mongoose'; 
 import { Fund, FundDocument } from '../financial-assets/schemas/fund.schema'; 
 
 interface SimulationConfig { 
   baseVolatility: number; 
   trendStrength: number; 
   eventFrequency: number; 
   initialFundValue: number; 
   tradingHoursStart: number; 
   tradingHoursEnd: number; 
 } 
 
 @Injectable() 
 export class MarketSimulationService { 
   private readonly logger = new Logger(MarketSimulationService.name); 
   private simulationInterval: NodeJS.Timeout; 
   private currentSimulationDay: number = 0; 
   private config: SimulationConfig = { 
     baseVolatility: 0.005, // Daily volatility factor 
     trendStrength: 0.0001, // Factor for market trend 
     eventFrequency: 0.1, // Chance of a significant event daily 
     initialFundValue: 1.0000, 
     tradingHoursStart: 9.5, // 9:30 AM 
     tradingHoursEnd: 15.0,  // 3:00 PM 
   }; 
 
   constructor(@InjectModel(Fund.name) private fundModel: Model<FundDocument>) { 
     this.initializeSimulation(); 
   } 
 
   // --- Core Simulation Logic --- 
   private initializeSimulation() { 
     this.logger.log('Initializing market simulation...'); 
     this.seedInitialFunds(); 
     this.startPriceUpdates(); 
   } 
 
   private async seedInitialFunds() { 
     const count = await this.fundModel.countDocuments(); 
     if (count === 0) { 
       await this.fundModel.insertMany([ 
         { name: '稳健增长私募一号', type: 'Private Equity', currentNav: this.config.initialFundValue, dailyChange: 0, totalReturn: 0, riskLevel: 'High', minInvestment: 1000000, strategy: '量化对冲', inceptionDate: new Date(), description: '专注于市场中性策略，追求绝对收益。', totalAssets: 500000000, managementFee: 0.00005, performanceFee: 0.20, subscriptionFeeRate: 0.01, redemptionFeeRate: 0.005, lockupPeriodMonths: 6 }, 
         { name: '均衡配置公募基金', type: 'Public Fund', currentNav: this.config.initialFundValue, dailyChange: 0, totalReturn: 0, riskLevel: 'Medium', minInvestment: 1000, strategy: '股票+债券混合', inceptionDate: new Date(), description: '平衡股票与债券配置，追求长期稳健增长。', totalAssets: 1200000000, managementFee: 0.00001, performanceFee: 0, subscriptionFeeRate: 0.005, redemptionFeeRate: 0.0025 }, 
         // ... more simulated funds 
       ]); 
       this.logger.log('Initial funds seeded.'); 
     } 
   } 
 
   private startPriceUpdates() { 
     this.simulationInterval = setInterval(() => this.updateAllFundPrices(), 5000); // Update every 5 seconds 
     this.logger.log('Market price updates started.'); 
   } 
 
   private async updateAllFundPrices() { 
     const now = new Date(); 
     const currentHour = now.getHours() + now.getMinutes() / 60; 
     const isTradingDay = this.isSimulatedTradingDay(now); 
 
     if (!isTradingDay || currentHour < this.config.tradingHoursStart || currentHour > this.config.tradingHoursEnd) { 
       await this.updateOffHoursPrices(); 
       return; 
     } 
 
     const funds = await this.fundModel.find({}); 
     for (const fund of funds) { 
       const randomFactor = (Math.random() - 0.5) * 2; // Random between -1 and 1 
       const dailyVolatility = this.config.baseVolatility * (fund.riskLevel === 'High' ? 2 : 1); 
       
       const marketTrend = this.config.trendStrength * (Math.random() - 0.2); 
 
       let priceChange = fund.currentNav * (randomFactor * dailyVolatility + marketTrend); 
 
       const newNav = fund.currentNav + priceChange; 
       fund.dailyChange = priceChange; 
       fund.currentNav = Math.max(0.0001, newNav); 
       fund.totalReturn = (fund.currentNav - this.config.initialFundValue) / this.config.initialFundValue; 
 
       fund.navHistory.push({ date: now, value: fund.currentNav }); 
       if (fund.navHistory.length > 365) { 
         fund.navHistory.shift(); 
       } 
 
       await fund.save(); 
     } 
     this.logger.debug('Fund prices updated.'); 
   } 
 
   private async updateOffHoursPrices() { 
       this.logger.debug('Off-hours: Minimal or no fund price updates.'); 
       const funds = await this.fundModel.find({}); 
       for (const fund of funds) { 
           fund.dailyChange = 0; 
           await fund.save(); 
       } 
   } 
 
   private isSimulatedTradingDay(date: Date): boolean { 
       const dayOfWeek = date.getDay(); 
       return dayOfWeek !== 0 && dayOfWeek !== 6; 
   } 
 
   async setFundDailyChange(fundId: string, changePercentage: number) { 
     const fund = await this.fundModel.findById(fundId); 
     if (fund) { 
       fund.currentNav = fund.currentNav * (1 + changePercentage / 100); 
       fund.dailyChange = fund.currentNav * (changePercentage / 100); 
       await fund.save(); 
       this.logger.warn(`Admin manually set ${fund.name} change to ${changePercentage}%`); 
     } 
   } 
 
   // 新增方法：获取所有基金 
   async findAllFunds(): Promise<FundDocument[]> { 
     return this.fundModel.find().exec(); 
   } 
 }