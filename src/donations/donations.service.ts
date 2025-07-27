import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { DonationProject, DonationProjectDocument } from './schemas/donation-project.schema';
import { UserDonation, UserDonationDocument } from './schemas/user-donation.schema';

@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name);
  private readonly VIRTUAL_TO_REAL_RATIO = 0.001; // 示例：1000虚拟财富 = 1元真实捐赠

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DonationProject.name) private projectModel: Model<DonationProjectDocument>,
    @InjectModel(UserDonation.name) private userDonationModel: Model<UserDonationDocument>,
  ) {
    this.seedInitialProjects();
  }

  // 播种初始公益项目
  private async seedInitialProjects() {
    const count = await this.projectModel.countDocuments();
    if (count === 0) {
      await this.projectModel.insertMany([
        { name: '乡村智慧课堂计划', description: '为偏远地区学校提供数字教学设备，点亮孩子们的未来。', targetAmount: 1000000, currentVirtualAmount: 0, status: 'Active', imageUrl: 'https://placehold.co/400x200/27AE60/FFFFFF?text=Education', realDonatedAmount: 0 },
        { name: '荒漠绿洲计划', description: '资助西北地区植树造林，改善生态环境，守护绿色家园。', targetAmount: 2000000, currentVirtualAmount: 0, status: 'Active', imageUrl: 'https://placehold.co/400x200/27AE60/FFFFFF?text=Environment', realDonatedAmount: 0 },
        { name: '科技助残项目', description: '通过科技力量，为残障人士提供辅助工具和教育支持。', targetAmount: 1500000, currentVirtualAmount: 0, status: 'Active', imageUrl: 'https://placehold.co/400x200/27AE60/FFFFFF?text=Technology', realDonatedAmount: 0 },
      ]);
      this.logger.log('Initial donation projects seeded.');
    }
  }

  // 用户“贡献”其财富增长至公益项目
  async contributeToPublicGood(userId: string, virtualAmount: number, projectId: string): Promise<UserDonationDocument> {
    if (virtualAmount <= 0) {
      throw new BadRequestException('贡献金额必须为正数。');
    }

    const user = await this.userModel.findById(userId);
    const project = await this.projectModel.findById(projectId);

    if (!user || !project) {
      throw new BadRequestException('用户或项目不存在。');
    }

    project.currentVirtualAmount += virtualAmount;
    const realDonationEquivalent = virtualAmount * this.VIRTUAL_TO_REAL_RATIO;
    project.realDonatedAmount += realDonationEquivalent;

    await project.save();

    const userDonation = await this.userDonationModel.create({
      userId: user._id,
      projectId: project._id,
      virtualAmount: virtualAmount,
      realAmountEquivalent: realDonationEquivalent,
      timestamp: new Date(),
    });

    this.logger.log(`用户 ${userId} 贡献了 ${virtualAmount} 财富增长至 ${project.name}。等值真实捐赠: ${realDonationEquivalent} 元。`);
    return userDonation;
  }

  async getAllDonationProjects(): Promise<DonationProjectDocument[]> {
    return this.projectModel.find({});
  }

  async getUserDonations(userId: string): Promise<UserDonationDocument[]> {
    return this.userDonationModel.find({ userId }).populate('projectId');
  }

  async processRealWorldDonations() {
    this.logger.log('处理真实世界的捐赠...');
    const projectsToDonate = await this.projectModel.find({ status: 'Active', currentVirtualAmount: { $gte: 500000 } }); 
    for (const project of projectsToDonate) {
      const amountToDonate = project.currentVirtualAmount * this.VIRTUAL_TO_REAL_RATIO;
      project.status = 'Completed';
      project.currentVirtualAmount = 0;
      await project.save();
      this.logger.log(`平台已向 ${project.name} 代捐 ${amountToDonate} 元人民币。`);
    }
  }
}
