import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FundDocument = Fund & Document;

@Schema()
export class Fund {
  @Prop({ required: true })
  name: string; // 基金名称

  @Prop({ required: true, enum: ['Private Equity', 'Public Fund'] })
  type: string; // 基金类型: 私募基金 或 公募基金

  @Prop({ required: true, default: 1.0000 })
  currentNav: number; // 当前净值

  @Prop({ default: 0 })
  dailyChange: number; // 日涨跌额

  @Prop({ default: 0 })
  totalReturn: number; // 累计回报率

  @Prop({ required: true, enum: ['Low', 'Medium', 'High'] })
  riskLevel: string; // 风险等级

  @Prop({ required: true })
  minInvestment: number; // 最小投资金额 (门槛)

  @Prop({ required: true })
  strategy: string; // 投资策略 (如: 量化对冲, 股票多头, 混合型)

  @Prop()
  inceptionDate: Date; // 成立日期 (用于模拟封闭期等)

  @Prop()
  description: string; // 基金描述

  @Prop()
  totalAssets: number; // 模拟基金规模

  @Prop({ default: 0 })
  managementFee: number; // 模拟管理费率 (每日/每年扣除)

  @Prop({ default: 0 })
  performanceFee: number; // 模拟业绩报酬率 (私募基金特有)

  @Prop({ default: 0 })
  subscriptionFeeRate: number; // 申购费率

  @Prop({ default: 0 })
  redemptionFeeRate: number; // 赎回费率

  @Prop({ default: 0 })
  lockupPeriodMonths?: number; // 封闭期 (月, 私募基金特有)

  @Prop({ default: [] })
  navHistory: { date: Date; value: number }[]; // 净值历史 (用于图表)
}

export const FundSchema = SchemaFactory.createForClass(Fund);
