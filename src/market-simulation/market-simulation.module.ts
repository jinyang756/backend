import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Fund, FundSchema } from '../financial-assets/schemas/fund.schema';
import { MarketSimulationService } from './market-simulation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Fund.name, schema: FundSchema }])
  ],
  controllers: [],
  providers: [MarketSimulationService],
  exports: [MarketSimulationService]
})
export class MarketSimulationModule {}