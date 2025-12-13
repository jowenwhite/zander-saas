import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PrismaService } from '../../prisma.service';
import { DealsService } from '../services/deals.service';
import { Deal, DealStage, DealPriority } from '@prisma/client';

@Resolver()
export class DealsResolver {
  constructor(
    private prisma: PrismaService,
    private dealsService: DealsService
  ) {}

  @Query('getDeal')
  async getDeal(@Args('id', { type: () => ID }) id: string) {
    return this.prisma.deal.findUnique({
      where: { id },
      include: { contact: true }
    });
  }

  @Query('listDeals')
  async listDeals(
    @Args('stage', { type: () => DealStage, nullable: true }) stage?: DealStage,
    @Args('priority', { type: () => DealPriority, nullable: true }) priority?: DealPriority,
    @Args('minValue', { type: () => Number, nullable: true }) minValue?: number,
    @Args('maxValue', { type: () => Number, nullable: true }) maxValue?: number
  ) {
    return this.prisma.deal.findMany({
      where: {
        stage,
        priority,
        dealValue: {
          gte: minValue,
          lte: maxValue
        }
      },
      include: { contact: true }
    });
  }

  @Query('getPipelineMetrics')
  async getPipelineMetrics(@Args('tenantId', { type: () => ID }) tenantId: string) {
    return this.dealsService.calculatePipelineMetrics(tenantId);
  }

  @Mutation('createDeal')
  async createDeal(@Args('input') input: any) {
    return this.prisma.deal.create({
      data: {
        ...input,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: { contact: true }
    });
  }

  @Mutation('updateDeal')
  async updateDeal(@Args('input') input: any) {
    const { id, ...updateData } = input;
    return this.prisma.deal.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: { contact: true }
    });
  }

  @Mutation('deleteDeal')
  async deleteDeal(@Args('id', { type: () => ID }) id: string) {
    await this.prisma.deal.delete({ where: { id } });
    return true;
  }

  @Mutation('moveDealStage')
  async moveDealStage(
    @Args('id', { type: () => ID }) id: string, 
    @Args('newStage', { type: () => DealStage }) newStage: DealStage
  ) {
    return this.prisma.deal.update({
      where: { id },
      data: { 
        stage: newStage,
        updatedAt: new Date()
      },
      include: { contact: true }
    });
  }
}
