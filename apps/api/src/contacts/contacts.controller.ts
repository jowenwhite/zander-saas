import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { Public } from '../auth/jwt-auth.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Public()
  @Get()
  async findAll() {
    const tenantId = 'cmj4gfco20000pqr0f92r3gif';
    return this.contactsService.findAll(tenantId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tenantId = 'cmj4gfco20000pqr0f92r3gif';
    return this.contactsService.findOne(tenantId, id);
  }

  @Public()
  @Post()
  async create(@Body() createContactDto: any) {
    const tenantId = 'cmj4gfco20000pqr0f92r3gif';
    return this.contactsService.create(tenantId, createContactDto);
  }
}
