import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PortfolioDocument = Portfolio & Document;

@Schema()
export class Portfolio {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // 用户ID

  @Prop({ type: Types.ObjectId, ref: 'Fund', required: true })
  fundId: Types.ObjectId; // 基金ID

  @Prop({ required: true })
  shares: number; // 持有份额

  @Prop({ required: true })
  averageCost: number; // 平均成本

  @Prop({ default: new Date() })
  purchaseDate: Date; // 首次购买日期 (用于封闭期计算)
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);
