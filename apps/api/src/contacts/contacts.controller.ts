import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactsService } from './contacts.service';

@Controller('contacts')
@UseGuards(JwtAuthGuard) // All routes require authentication
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  // GET /contacts - List all contacts with filters
  @Get()
  async findAll(@Request() req, @Query() query: any) {
    return this.contactsService.findAll(req.tenantId, query);
  }

  // GET /contacts/:id - Get single contact
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.contactsService.findOne(id, req.tenantId);
  }
  // POST /contacts - Create new contact

  @Post()
  async create(@Body() data: any, @Request() req) {
    return this.contactsService.create(data, req.tenantId);
  }

  // PATCH /contacts/:id - Update contact
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.contactsService.update(id, data, req.tenantId);
  }

  // DELETE /contacts/:id - Delete contact
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.contactsService.delete(id, req.tenantId);
  }

  // POST /contacts/import - Bulk import
  @Post('import')
  async bulkImport(@Body() data: { contacts: any[] }, @Request() req) {
    return this.contactsService.bulkImport(data.contacts, req.tenantId);
  }

  // GET /contacts/export - Export contacts (returns CSV data)
  @Get('export')
  async export(@Request() req) {
    const { data } = await this.contactsService.findAll(req.tenantId, { limit: 10000 });
    
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
