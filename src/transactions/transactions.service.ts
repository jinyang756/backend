import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Fund, FundDocument } from '../financial-assets/schemas/fund.schema';
import { Portfolio, PortfolioDocument } from '../portfolio/schemas/portfolio.schema';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Fund.name) private fundModel: Model<FundDocument>,
    @InjectModel(Portfolio.name) private portfolioModel: Model<PortfolioDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  // --- Simulate Account Funding (Initial "千元启动金" and subsequent "充值") ---
  async fundAccount(userId: string, amount: number, type: 'initial' | 'deposit'): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found.');
    }
    if (amount <= 0) {
      throw new BadRequestException('Funding amount must be positive.');
    }

    user.availableBalance += amount;
    if (type === 'initial') {
      user.initialCapital = amount;
    }
    await user.save();

    await this.transactionModel.create({
      userId: user._id,
      type: type === 'initial' ? 'Initial Funding' : 'Deposit',
      amount: amount,
      status: 'Completed',
      description: type === 'initial' ? '开户启动金入账' : '账户充值',
      timestamp: new Date(),
    });

    this.logger.log(`User ${userId} account funded with ${amount}. Type: ${type}`);
    return user;
  }

  // --- Simulate Fund Purchase (申购) ---
  async purchaseFund(userId: string, fundId: string, amount: number): Promise<TransactionDocument> {
    if (amount <= 0) {
      throw new BadRequestException('申购金额必须为正数。');
    }

    const user = await this.userModel.findById(userId);
    const fund = await this.fundModel.findById(fundId);

    if (!user || !fund) {
      throw new BadRequestException('用户或基金不存在。');
    }

    if (fund.type === 'Private Equity' && amount < fund.minInvestment) {
      throw new ForbiddenException(`购买 ${fund.name} 需要至少 ${fund.minInvestment} 元，您的申购金额不足。`);
    }
    if (fund.type === 'Private Equity' && !user.isQualifiedInvestorSimulated) {
        throw new ForbiddenException('请先完成合格投资者确认。');
    }

    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const isTradingDay = now.getDay() !== 0 && now.getDay() !== 6;

    if (!isTradingDay || currentHour < 9.5 || currentHour > 15.0) {
        throw new BadRequestException('当前非交易时间，交易指令将在下一交易日处理。');
    }

    const subscriptionFee = amount * fund.subscriptionFeeRate;
    const netAmount = amount + subscriptionFee;

    if (user.availableBalance < netAmount) {
      throw new BadRequestException('可用资金不足以支付申购金额和费用。');
    }

    user.availableBalance -= netAmount;
    await user.save();

    const shares = amount / fund.currentNav;

    let portfolioItem = await this.portfolioModel.findOne({ userId, fundId: fund._id });
    if (portfolioItem) {
      portfolioItem.shares += shares;
      portfolioItem.averageCost = (portfolioItem.averageCost * (portfolioItem.shares - shares) + amount) / portfolioItem.shares;
    } else {
      portfolioItem = await this.portfolioModel.create({
        userId,
        fundId: fund._id,
        shares,
        averageCost: amount,
        purchaseDate: now,
      });
    }
    await portfolioItem.save();

    const transaction = await this.transactionModel.create({
      userId: user._id,
      fundId: fund._id,
      type: 'Purchase',
      amount: amount,
      shares,
      fee: subscriptionFee,
      status: 'Completed',
      description: `申购 ${fund.name}`,
      timestamp: now,
    });

    this.logger.log(`用户 ${userId} 申购了 ${amount} 元的 ${fund.name}。份额: ${shares}, 费用: ${subscriptionFee}`);
    return transaction;
  }

  // --- Simulate Fund Redemption (赎回) ---
  async redeemFund(userId: string, fundId: string, sharesToRedeem: number): Promise<TransactionDocument> {
    if (sharesToRedeem <= 0) {
      throw new BadRequestException('赎回份额必须为正数。');
    }

    const user = await this.userModel.findById(userId);
    const fund = await this.fundModel.findById(fundId);
    const portfolioItem = fund ? await this.portfolioModel.findOne({ userId, fundId: fund._id }) : null;

    if (!user || !fund || !portfolioItem || portfolioItem.shares < sharesToRedeem) {
      throw new BadRequestException('无效的赎回请求：用户、基金、持仓不存在或份额不足。');
    }

    if (fund.type === 'Private Equity' && fund.lockupPeriodMonths) {
        const inceptionDate = portfolioItem.purchaseDate;
        const today = new Date();
        const monthsSincePurchase = (today.getFullYear() - inceptionDate.getFullYear()) * 12 + (today.getMonth() - inceptionDate.getMonth());
        
        if (monthsSincePurchase < fund.lockupPeriodMonths) {
            throw new ForbiddenException(`该私募基金处于封闭期，${fund.lockupPeriodMonths - monthsSincePurchase}个月内无法赎回。`);
        }
    }

    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const isTradingDay = now.getDay() !== 0 && now.getDay() !== 6;

    if (!isTradingDay || currentHour < 9.5 || currentHour > 15.0) {
        throw new BadRequestException('当前非交易时间，赎回指令将在下一交易日处理。');
    }

    const redemptionAmount = sharesToRedeem * fund.currentNav;
    const redemptionFee = redemptionAmount * fund.redemptionFeeRate;
    const netRedemptionAmount = redemptionAmount - redemptionFee;

    portfolioItem.shares -= sharesToRedeem;
    if (portfolioItem.shares <= 0) {
      await portfolioItem.deleteOne();
    } else {
      await portfolioItem.save();
    }

    user.availableBalance += netRedemptionAmount;
    await user.save();

    const transaction = await this.transactionModel.create({
      userId: user._id,
      fundId: fund._id,
      type: 'Redemption',
      amount: redemptionAmount,
      shares: sharesToRedeem,
      fee: redemptionFee,
      status: 'Completed',
      description: `赎回 ${fund.name}`,
      timestamp: now,
    });

    this.logger.log(`用户 ${userId} 赎回了 ${sharesToRedeem} 份额的 ${fund.name}。净到账: ${netRedemptionAmount}`);
    return transaction;
  }

  // --- Simulate Account Asset Overview Calculation ---
  async getUserAssetOverview(userId: string) {
      const user = await this.userModel.findById(userId);
      if (!user) {
          throw new BadRequestException('User not found.');
      }

      const portfolioItems = await this.portfolioModel.find({ userId }).populate('fundId');
      let totalPortfolioValue = 0;
      let totalInvestmentCost = 0;
      const assetHistory: { date: Date; value: number; }[] = [];

      for (const item of portfolioItems) {
          // 安全地转换类型并添加空值检查
          const fund = item.fundId as unknown as FundDocument;
          if (!fund) continue;

          totalPortfolioValue += item.shares * fund.currentNav;
          totalInvestmentCost += item.shares * item.averageCost;

          // 简化资产历史聚合：实际需要更复杂的逻辑来计算每日总资产
          // 这里的示例是将基金的净值历史作为资产历史的一部分
          if (fund.navHistory && fund.navHistory.length > 0) {
            fund.navHistory.forEach(nav => {
                assetHistory.push({ date: nav.date, value: user.initialCapital + (nav.value - fund.navHistory[0].value) * item.shares });
            });
          }
      }

      const totalAsset = user.availableBalance + totalPortfolioValue;
      const totalProfit = totalAsset - user.initialCapital - totalInvestmentCost;

      assetHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
          availableBalance: user.availableBalance,
          totalPortfolioValue,
          totalAsset,
          totalProfit,
          totalInvestmentCost,
          assetHistory,
      };
  }
}
