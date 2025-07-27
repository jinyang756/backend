import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string; // 用户名

  @Prop({ required: true })
  passwordHash: string; // 密码哈希

  @Prop({ default: 0 })
  availableBalance: number; // 可用资金

  @Prop({ default: 0 })
  totalAsset: number; // 总资产

  @Prop({ default: 0 })
  initialCapital: number; // 初始投入资金 (用于计算总收益)

  @Prop({ default: false })
  isQualifiedInvestorSimulated: boolean; // 是否完成合格投资者模拟确认

  @Prop({ default: new Date() })
  createdAt: Date; // 创建时间

  @Prop({ default: Date.now })
  updatedAt: Date; // 更新时间
}

export const UserSchema = SchemaFactory.createForClass(User);
