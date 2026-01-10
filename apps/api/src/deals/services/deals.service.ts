import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Deal } from '@prisma/client';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async calculatePipelineMetrics(tenantId: string) {
    const deals = await this.prisma.deal.findMany({
      where: { tenantId }
    });

    return {
      totalPipelineValue: deals.reduce((sum, deal) => sum + deal.dealValue, 0),
      dealCountByStage: deals.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1;
        return acc;
      }, {}),
      averageDealSize: deals.length > 0 
        ? deals.reduce((sum, deal) => sum + deal.dealValue, 0) / deals.length 
        : 0,
      winRate: this.calculateWinRate(deals)
    };
  }

  private calculateWinRate(deals: Deal[]): number {
    if (deals.length === 0) return 0;
    
    const totalDeals = deals.length;
    const wonDeals = deals.filter(deal => deal.stage === 'CLOSED_WON').length;
    
    return (wonDeals / totalDeals) * 100;
  }
}
