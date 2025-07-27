import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DonationProjectDocument = DonationProject & Document;

@Schema()
export class DonationProject {
  @Prop({ required: true })
  name: string; // 项目名称

  @Prop()
  description: string; // 项目描述

  @Prop({ required: true })
  targetAmount: number; // 目标虚拟贡献金额

  @Prop({ default: 0 })
  currentVirtualAmount: number; // 当前已累积虚拟贡献金额

  @Prop({ default: 0 })
  realDonatedAmount: number; // 平台已代捐的真实金额

  @Prop({ required: true, enum: ['Active', 'Completed', 'Paused'] })
  status: string; // 项目状态

  @Prop()
  imageUrl: string; // 项目图片

  @Prop({ default: new Date() })
  createdAt: Date;
}

export const DonationProjectSchema = SchemaFactory.createForClass(DonationProject);
