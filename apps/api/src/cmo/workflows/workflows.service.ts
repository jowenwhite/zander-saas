import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.workflow.findMany({
      where: { tenantId },
      include: {
        nodes: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { executions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
      include: {
        nodes: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { executions: true } },
      },
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }
    return workflow;
  }

  async create(
    tenantId: string,
    data: {
      name: string;
      description?: string;
      triggerType: string;
      triggerConfig?: any;
      nodes?: {
        nodeType: string;
        name: string;
        config?: any;
        positionX?: number;
        positionY?: number;
        sortOrder?: number;
      }[];
    },
  ) {
    const workflow = await this.prisma.workflow.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        triggerConfig: data.triggerConfig || {},
        status: 'draft',
      },
    });

    if (data.nodes && data.nodes.length > 0) {
      await this.prisma.workflowNode.createMany({
        data: data.nodes.map((node, index) => ({
          workflowId: workflow.id,
          nodeType: node.nodeType,
          name: node.name,
          config: node.config || {},
          positionX: node.positionX || 0,
          positionY: node.positionY || index * 100,
          sortOrder: node.sortOrder ?? index,
        })),
      });
    }

    return this.findOne(workflow.id, tenantId);
  }

  async update(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      description?: string;
      triggerType?: string;
      triggerConfig?: any;
      nodes?: {
        id?: string;
        nodeType: string;
        name: string;
        config?: any;
        positionX?: number;
        positionY?: number;
        nextNodeId?: string;
        trueBranchId?: string;
        falseBranchId?: string;
        sortOrder?: number;
      }[];
    },
  ) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    await this.prisma.workflow.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        triggerConfig: data.triggerConfig,
      },
    });

    if (data.nodes) {
      await this.prisma.workflowNode.deleteMany({
        where: { workflowId: id },
      });

      if (data.nodes.length > 0) {
        await this.prisma.workflowNode.createMany({
          data: data.nodes.map((node, index) => ({
            workflowId: id,
            nodeType: node.nodeType,
            name: node.name,
            config: node.config || {},
            positionX: node.positionX || 0,
            positionY: node.positionY || index * 100,
            nextNodeId: node.nextNodeId,
            trueBranchId: node.trueBranchId,
            falseBranchId: node.falseBranchId,
            sortOrder: node.sortOrder ?? index,
          })),
        });
      }
    }

    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    await this.prisma.workflow.delete({ where: { id } });
    return { success: true, message: 'Workflow deleted successfully' };
  }

  async activate(id: string, tenantId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return this.prisma.workflow.update({
      where: { id },
      data: { status: 'active' },
    });
  }

  async pause(id: string, tenantId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return this.prisma.workflow.update({
      where: { id },
      data: { status: 'paused' },
    });
  }

  async getExecutions(id: string, tenantId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return this.prisma.workflowExecution.findMany({
      where: { workflowId: id },
      include: { contact: true },
      orderBy: { enteredAt: 'desc' },
    });
  }
}
