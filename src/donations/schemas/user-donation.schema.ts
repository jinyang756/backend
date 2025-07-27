import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDonationDocument = UserDonation & Document;

@Schema()
export class UserDonation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // 用户ID

  @Prop({ type: Types.ObjectId, ref: 'DonationProject', required: true })
  projectId: Types.ObjectId; // 公益项目ID

  @Prop({ required: true })
  virtualAmount: number; // 用户贡献的虚拟金额

  @Prop({ required: true })
  realAmountEquivalent: number; // 等同于的真实捐赠金额

  @Prop({ default: new Date() })
  timestamp: Date; // 贡献时间
}

export const UserDonationSchema = SchemaFactory.createForClass(UserDonation);
