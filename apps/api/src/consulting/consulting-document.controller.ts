import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSignedDocumentDto, SignDocumentDto } from './dto/create-document.dto';
import { ConsultingEventType } from '@prisma/client';

@Controller('consulting/documents')
@UseGuards(JwtAuthGuard)
export class ConsultingDocumentController {
  private readonly logger = new Logger(ConsultingDocumentController.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new document (superadmin only)
   */
  @Post()
  async createDocument(
    @Request() req: any,
    @Body() dto: CreateSignedDocumentDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can create documents');
    }

    if (!dto.leadId && !dto.engagementId) {
      throw new ForbiddenException('Document must be linked to a lead or engagement');
    }

    const document = await this.prisma.signedDocument.create({
      data: {
        type: dto.type,
        leadId: dto.leadId,
        engagementId: dto.engagementId,
        documentName: dto.documentName,
        documentUrl: dto.documentUrl,
        templateVersion: dto.templateVersion,
        isSigned: false,
      },
    });

    this.logger.log(`Created document ${document.id}: ${dto.documentName}`);
    return document;
  }

  /**
   * List documents (filtered by lead or engagement)
   */
  @Get()
  async listDocuments(
    @Request() req: any,
    @Query('leadId') leadId?: string,
    @Query('engagementId') engagementId?: string,
    @Query('type') type?: string,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can list documents');
    }

    const where: any = {};
    if (leadId) where.leadId = leadId;
    if (engagementId) where.engagementId = engagementId;
    if (type) where.type = type;

    const documents = await this.prisma.signedDocument.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  }

  /**
   * Get a specific document
   */
  @Get(':id')
  async getDocument(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can view documents');
    }

    const document = await this.prisma.signedDocument.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return document;
  }

  /**
   * Record a signature on a document
   * This is called after the client-side signature capture
   */
  @Patch(':id/sign')
  async signDocument(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: SignDocumentDto,
  ) {
    // Allow either superadmin or system (for webhook-based signing)
    // In future, could allow the signer themselves via a secure token

    const document = await this.prisma.signedDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    if (document.isSigned) {
      throw new ForbiddenException('Document has already been signed');
    }

    const signedDocument = await this.prisma.signedDocument.update({
      where: { id },
      data: {
        isSigned: true,
        signedAt: new Date(),
        signerName: dto.signerName,
        signerEmail: dto.signerEmail.toLowerCase(),
        signerIp: dto.signerIp,
        signatureDataUrl: dto.signatureDataUrl,
        documentUrl: dto.documentUrl || document.documentUrl,
      },
    });

    // Log event
    if (document.leadId) {
      await this.prisma.consultingEvent.create({
        data: {
          type: ConsultingEventType.DOCUMENT_SIGNED,
          leadId: document.leadId,
          engagementId: document.engagementId,
          description: `${document.type} signed by ${dto.signerName}`,
          metadata: {
            documentId: id,
            documentType: document.type,
            signerName: dto.signerName,
            signerEmail: dto.signerEmail,
          },
          actorType: 'user',
          actorId: req.user?.id,
        },
      });
    }

    this.logger.log(`Document ${id} signed by ${dto.signerEmail}`);
    return signedDocument;
  }

  /**
   * Get documents that need to be signed for a lead
   */
  @Get('pending/:leadId')
  async getPendingDocuments(
    @Request() req: any,
    @Param('leadId') leadId: string,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can view pending documents');
    }

    const documents = await this.prisma.signedDocument.findMany({
      where: {
        leadId,
        isSigned: false,
      },
      orderBy: { createdAt: 'asc' },
    });

    return documents;
  }
}
