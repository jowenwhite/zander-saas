import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { KnowledgeCategory } from '@prisma/client';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    category?: KnowledgeCategory;
    isPublished?: boolean;
    search?: string;
  }) {
    const where: any = {};
    
    if (filters?.category) where.category = filters.category;
    if (filters?.isPublished !== undefined) where.isPublished = filters.isPublished;
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } },
        { searchTerms: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search.toLowerCase() } },
      ];
    }

    return this.prisma.knowledgeArticle.findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { title: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!article) {
      throw new NotFoundException(`Knowledge article with ID ${id} not found`);
    }

    return article;
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { slug },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!article) {
      throw new NotFoundException(`Knowledge article with slug ${slug} not found`);
    }

    // Increment view count
    await this.prisma.knowledgeArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  async search(query: string, limit: number = 10) {
    // AI-friendly search - returns articles matching query
    // Prioritizes searchTerms, then title, then content
    const articles = await this.prisma.knowledgeArticle.findMany({
      where: {
        isPublished: true,
        OR: [
          { searchTerms: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: query.toLowerCase().split(' ') } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        category: true,
        tags: true,
        content: true,
      },
      take: limit,
      orderBy: { viewCount: 'desc' },
    });

    return articles;
  }

  async create(data: {
    title: string;
    slug: string;
    content: string;
    summary?: string;
    category?: KnowledgeCategory;
    tags?: string[];
    searchTerms?: string;
    isPublished?: boolean;
    sortOrder?: number;
    createdById: string;
  }) {
    return this.prisma.knowledgeArticle.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        summary: data.summary,
        category: data.category || 'PLATFORM_GUIDE',
        tags: data.tags || [],
        searchTerms: data.searchTerms,
        isPublished: data.isPublished ?? true,
        sortOrder: data.sortOrder || 0,
        createdById: data.createdById,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: {
    title?: string;
    slug?: string;
    content?: string;
    summary?: string;
    category?: KnowledgeCategory;
    tags?: string[];
    searchTerms?: string;
    isPublished?: boolean;
    sortOrder?: number;
  }) {
    return this.prisma.knowledgeArticle.update({
      where: { id },
      data,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.knowledgeArticle.delete({
      where: { id },
    });
  }

  async getStats() {
    const [total, published, byCategory] = await Promise.all([
      this.prisma.knowledgeArticle.count(),
      this.prisma.knowledgeArticle.count({ where: { isPublished: true } }),
      this.prisma.knowledgeArticle.groupBy({
        by: ['category'],
        _count: true,
      }),
    ]);

    return {
      total,
      published,
      draft: total - published,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
