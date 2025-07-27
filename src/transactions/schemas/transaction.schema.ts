import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // 用户ID

  @Prop({ type: Types.ObjectId, ref: 'Fund' })
  fundId?: Types.ObjectId; // 基金ID (如果是充值/提现则为空)

  @Prop({ required: true, enum: ['Initial Funding', 'Deposit', 'Purchase', 'Redemption', 'Fee Deduction', 'Performance Fee'] })
  type: string; // 交易类型

  @Prop({ required: true })
  amount: number; // 交易金额 (申购金额/赎回金额/充值金额)

  @Prop()
  shares?: number; // 交易份额 (申购/赎回时有)

  @Prop({ default: 0 })
  fee?: number; // 交易费用

  @Prop({ required: true, enum: ['Pending', 'Completed', 'Failed', 'Queued'] })
  status: string; // 交易状态

  @Prop()
  description: string; // 交易描述

  @Prop({ default: new Date() })
  timestamp: Date; // 交易时间
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
