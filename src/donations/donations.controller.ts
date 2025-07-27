// ------------------------------------------------------------------------------------ 
 // backend/src/donations/donations.controller.ts 
 // ------------------------------------------------------------------------------------ 
 import { Controller, Get, Post, Body, Param } from '@nestjs/common'; 
 import { DonationsService } from './donations.service'; 
 import { DonationProjectDocument } from './schemas/donation-project.schema'; 
 import { UserDonationDocument } from './schemas/user-donation.schema'; 
 
 @Controller('api/donations') 
 export class DonationsController { 
   constructor(private readonly donationsService: DonationsService) {} 
 
   @Get('projects') 
   async getAllProjects(): Promise<DonationProjectDocument[]> { 
     return this.donationsService.getAllDonationProjects(); 
   } 
 
   @Post(':userId/contribute') 
   async contribute( 
     @Param('userId') userId: string, 
     @Body('projectId') projectId: string, 
     @Body('virtualAmount') virtualAmount: number, 
   ): Promise<UserDonationDocument> { 
     return this.donationsService.contributeToPublicGood(userId, virtualAmount, projectId); 
   } 
 
   @Get(':userId/my-contributions') 
   async getUserContributions(@Param('userId') userId: string): Promise<UserDonationDocument[]> { 
     return this.donationsService.getUserDonations(userId); 
   } 
 }