import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async findAll() {
    const tenantId = 'cmivq0r7s0000goa1v5fap9ga';
    return this.contactsService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tenantId = 'cmivq0r7s0000goa1v5fap9ga';
    return this.contactsService.findOne(tenantId, id);
  }

  @Post()
  async create(@Body() createContactDto: any) {
    const tenantId = 'cmivq0r7s0000goa1v5fap9ga';
    return this.contactsService.create(tenantId, createContactDto);
  }
}
