import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ContactsService } from './contacts.service';
import { ContactImportService } from './contact-import.service';
import { CreateContactDto, UpdateContactDto, ImportContactsDto } from './dto';
import { PersonRole } from './dto/create-contact.dto';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly contactImportService: ContactImportService,
  ) {}

  // POST /contacts/import/parse — parse uploaded file, return preview + mapping
  // Any authenticated user can import (contacts are user-scoped within tenant)
  @Post('import/parse')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async parseImport(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    return this.contactImportService.parseFile(file);
  }

  // POST /contacts/import/check-duplicates — diff import batch against existing contacts
  @Post('import/check-duplicates')
  async checkDuplicates(@Body() body: { contacts: any[] }, @Request() req) {
    return this.contactImportService.checkDuplicates(body.contacts, req.tenantId);
  }

  // POST /contacts/import/execute — create/update contacts from import batch
  @Post('import/execute')
  async executeImport(@Body() body: { contacts: any[]; duplicateStrategy: 'skip' | 'update' | 'import'; defaultRole: PersonRole; fileType: 'vcf' | 'csv' | 'xlsx' }, @Request() req) {
    const { tenantId, user } = req;
    return this.contactImportService.executeImport(
      body.contacts,
      body.duplicateStrategy || 'skip',
      body.defaultRole || PersonRole.CLIENT,
      body.fileType || 'csv',
      tenantId,
      user?.userId,
    );
  }

  // GET /contacts - List all contacts with filters
  // HIGH-3: Pass userId and role for ownership-based filtering
  @Get()
  async findAll(@Request() req, @Query() query: any) {
    const { tenantId, user } = req;
    return this.contactsService.findAll(tenantId, query, user?.userId, user?.role);
  }

  // GET /contacts/:id - Get single contact
  // HIGH-3: Pass userId and role for ownership-based access control
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const { tenantId, user } = req;
    return this.contactsService.findOne(id, tenantId, user?.userId, user?.role);
  }

  // POST /contacts - Create new contact
  // HIGH-3: Pass userId to set owner on creation
  // MEDIUM-1: Input validation via CreateContactDto
  @Post()
  async create(@Body() data: CreateContactDto, @Request() req) {
    const { tenantId, user } = req;
    return this.contactsService.create(data, tenantId, user?.userId);
  }

  // PATCH /contacts/:id - Update contact
  // MEDIUM-1: Input validation via UpdateContactDto
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateContactDto, @Request() req) {
    return this.contactsService.update(id, data, req.tenantId);
  }

  // DELETE /contacts/:id - Delete contact
  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.contactsService.delete(id, req.tenantId);
  }

  // POST /contacts/import - Bulk import
  // HIGH-4: Admin/Owner only - bulk operations are privileged
  // MEDIUM-1: Input validation via ImportContactsDto (validates each contact)
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Post('import')
  async bulkImport(@Body() data: ImportContactsDto, @Request() req) {
    return this.contactsService.bulkImport(data.contacts, req.tenantId);
  }

  // GET /contacts/export - Export contacts (returns CSV data)
  // HIGH-3: Pass userId and role for ownership-based filtering
  @Get('export')
  async export(@Request() req) {
    const { tenantId, user } = req;
    const { data } = await this.contactsService.findAll(tenantId, { limit: 10000 }, user?.userId, user?.role);
    
    // Convert to CSV format
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Source'];
    const csv = [
      headers.join(','),
      ...data.map(contact => [
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.phone || '',
        contact.company || '',
        contact.source || ""
      ].join(','))
    ].join('\n');

    return { csv };
  }
}
