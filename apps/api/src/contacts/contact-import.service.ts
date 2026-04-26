import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import { ImportContactDto } from './dto/import-contact.dto';
import { PersonRole } from './dto/create-contact.dto';

export interface SuggestedMapping {
  sourceField: string;
  targetField: string;
}

export interface ParseResult {
  fileType: 'vcf' | 'csv' | 'xlsx';
  totalRecords: number;
  detectedFields: string[];
  suggestedMapping: SuggestedMapping[];
  preview: ImportContactDto[];
  rawData: ImportContactDto[];
  rawRows?: Record<string, string>[];
}

export interface DuplicateRecord {
  importRecord: ImportContactDto;
  existingId: string;
  existingEmail?: string;
  matchReason: string;
}

export interface DuplicateCheckResult {
  newContacts: ImportContactDto[];
  duplicates: DuplicateRecord[];
  partialMatches: DuplicateRecord[];
}

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: { record: number; reason: string }[];
}

// Map common CSV/Excel header variants to Contact field names
const HEADER_MAP: Record<string, string> = {
  'first name': 'firstName',
  'firstname': 'firstName',
  'first_name': 'firstName',
  'fname': 'firstName',
  'given name': 'firstName',
  'given_name': 'firstName',
  'last name': 'lastName',
  'lastname': 'lastName',
  'last_name': 'lastName',
  'lname': 'lastName',
  'surname': 'lastName',
  'family name': 'lastName',
  'family_name': 'lastName',
  'name': 'fullName',
  'full name': 'fullName',
  'full_name': 'fullName',
  'contact name': 'fullName',
  'email': 'email',
  'email address': 'email',
  'email_address': 'email',
  'e-mail': 'email',
  'phone': 'phone',
  'phone number': 'phone',
  'phone_number': 'phone',
  'mobile': 'phone',
  'cell': 'phone',
  'telephone': 'phone',
  'company': 'company',
  'organization': 'company',
  'organisation': 'company',
  'employer': 'company',
  'title': 'title',
  'job title': 'title',
  'job_title': 'title',
  'position': 'title',
  'role': 'title',
  'notes': 'notes',
  'note': 'notes',
  'comments': 'notes',
};

function normalizeHeader(raw: string): string {
  return HEADER_MAP[raw.trim().toLowerCase()] || 'skip';
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  const lastName = parts.pop()!;
  return { firstName: parts.join(' '), lastName };
}

function buildSuggestedMapping(detectedFields: string[]): SuggestedMapping[] {
  return detectedFields.map(field => ({
    sourceField: field,
    targetField: normalizeHeader(field),
  }));
}

@Injectable()
export class ContactImportService {
  constructor(private prisma: PrismaService) {}

  async parseFile(file: Express.Multer.File): Promise<ParseResult> {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const mime = file.mimetype.toLowerCase();

    if (ext === 'vcf' || mime.includes('vcard') || mime.includes('x-vcard')) {
      return this.parseVCard(file.buffer);
    }
    if (ext === 'csv' || mime.includes('csv') || mime === 'text/plain') {
      return this.parseCsv(file.buffer);
    }
    if (ext === 'xlsx' || ext === 'xls' || mime.includes('spreadsheet') || mime.includes('excel')) {
      return this.parseExcel(file.buffer);
    }

    throw new BadRequestException(
      'Unsupported file format. Please upload a .vcf, .csv, .xlsx, or .xls file.',
    );
  }

  private parseVCard(buffer: Buffer): ParseResult {
    const text = buffer.toString('utf-8');

    // Manual vCard parser — handles any version without relying on library version checks
    const rawCards = text
      .split(/END:VCARD/i)
      .map(block => block.trim())
      .filter(block => /BEGIN:VCARD/i.test(block));

    if (rawCards.length === 0) {
      throw new BadRequestException('No contacts found in vCard file.');
    }

    // Parse each block into a key→value map (first value wins for each key)
    function parseBlock(block: string): Record<string, string> {
      const props: Record<string, string> = {};
      // Handle line folding: CRLF/LF followed by a space/tab is a continuation
      const unfolded = block.replace(/\r?\n[ \t]/g, '');
      for (const line of unfolded.split(/\r?\n/)) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        // Strip parameter groups: "item1.EMAIL;type=INTERNET" → "EMAIL"
        const rawKey = line.substring(0, colonIdx).split(';')[0].split('.').pop()!.toUpperCase().trim();
        const val = line.substring(colonIdx + 1).trim();
        if (rawKey && val && !props[rawKey]) props[rawKey] = val;
      }
      return props;
    }

    const contacts: ImportContactDto[] = rawCards.map(block => {
      const props = parseBlock(block);

      // N field: lastName;firstName;middle;prefix;suffix
      let firstName = '';
      let lastName = '';
      if (props['N']) {
        const parts = props['N'].split(';');
        lastName = (parts[0] || '').trim();
        firstName = (parts[1] || '').trim();
      }

      // FN fallback
      if (!firstName && !lastName && props['FN']) {
        const parsed = splitFullName(props['FN']);
        firstName = parsed.firstName;
        lastName = parsed.lastName;
      } else if (!firstName && lastName) {
        firstName = lastName;
        lastName = '';
      }

      // ORG may contain dept separated by semicolon: "Acme;Sales Dept" → "Acme"
      const company = props['ORG'] ? props['ORG'].split(';')[0].trim() : undefined;

      return {
        firstName: firstName || props['FN'] || 'Unknown',
        lastName: lastName || '',
        email: props['EMAIL'] || undefined,
        phone: props['TEL'] || undefined,
        company: company || undefined,
        title: props['TITLE'] || undefined,
        notes: props['NOTE'] || undefined,
        source: 'import:vcf',
        primaryRole: PersonRole.CLIENT,
      };
    });

    const cleanContacts = contacts.filter(c => c.firstName !== 'Unknown' || c.email);

    return {
      fileType: 'vcf',
      totalRecords: cleanContacts.length,
      detectedFields: ['FN/N', 'EMAIL', 'TEL', 'ORG', 'TITLE', 'NOTE'],
      suggestedMapping: [
        { sourceField: 'FN/N', targetField: 'firstName + lastName' },
        { sourceField: 'EMAIL', targetField: 'email' },
        { sourceField: 'TEL', targetField: 'phone' },
        { sourceField: 'ORG', targetField: 'company' },
        { sourceField: 'TITLE', targetField: 'title' },
        { sourceField: 'NOTE', targetField: 'notes' },
      ],
      preview: cleanContacts.slice(0, 10),
      rawData: cleanContacts,
    };
  }

  private parseCsv(buffer: Buffer): ParseResult {
    const text = buffer.toString('utf-8');
    // Cast needed: @types/papaparse overloads return void for the string+config form
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    }) as Papa.ParseResult<Record<string, string>>;

    if (!result.data || result.data.length === 0) {
      throw new BadRequestException('No data found in CSV file.');
    }

    const headers = (result.meta?.fields || []) as string[];
    const mapping = buildSuggestedMapping(headers);

    const contacts = this.applyMappingToRows(result.data, mapping, 'csv');

    return {
      fileType: 'csv',
      totalRecords: contacts.length,
      detectedFields: headers,
      suggestedMapping: mapping,
      preview: contacts.slice(0, 10),
      rawData: contacts,
      rawRows: result.data,
    };
  }

  private async parseExcel(buffer: Buffer): Promise<ParseResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('No worksheets found in Excel file.');
    }

    const rows: Record<string, string>[] = [];
    let headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        headers = (row.values as any[]).slice(1).map(v => String(v ?? ''));
        return;
      }
      const record: Record<string, string> = {};
      (row.values as any[]).slice(1).forEach((cell, idx) => {
        if (headers[idx]) {
          record[headers[idx]] = String(cell ?? '').trim();
        }
      });
      if (Object.values(record).some(v => v)) rows.push(record);
    });

    if (rows.length === 0) {
      throw new BadRequestException('No data rows found in Excel file.');
    }

    const mapping = buildSuggestedMapping(headers);
    const contacts = this.applyMappingToRows(rows, mapping, 'xlsx');

    return {
      fileType: 'xlsx',
      totalRecords: contacts.length,
      detectedFields: headers,
      suggestedMapping: mapping,
      preview: contacts.slice(0, 10),
      rawData: contacts,
      rawRows: rows,
    };
  }

  private applyMappingToRows(
    rows: Record<string, string>[],
    mapping: SuggestedMapping[],
    fileType: 'csv' | 'xlsx',
  ): ImportContactDto[] {
    return rows
      .map(row => {
        const contact: Partial<ImportContactDto> & { fullName?: string } = {
          source: `import:${fileType}`,
          primaryRole: PersonRole.CLIENT,
        };

        for (const m of mapping) {
          const value = (row[m.sourceField] || '').trim();
          if (!value || m.targetField === 'skip') continue;

          if (m.targetField === 'fullName') {
            contact.fullName = value;
          } else {
            (contact as any)[m.targetField] = value;
          }
        }

        // Split fullName if firstName wasn't mapped separately
        if (!contact.firstName && contact.fullName) {
          const { firstName, lastName } = splitFullName(contact.fullName);
          contact.firstName = firstName;
          contact.lastName = contact.lastName || lastName;
        }
        delete contact.fullName;

        // Must have at least firstName
        if (!contact.firstName) return null;
        contact.lastName = contact.lastName || '';

        return contact as ImportContactDto;
      })
      .filter((c): c is ImportContactDto => c !== null);
  }

  async checkDuplicates(
    contacts: ImportContactDto[],
    tenantId: string,
  ): Promise<DuplicateCheckResult> {
    const existing = await this.prisma.contact.findMany({
      where: { tenantId },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true },
    });

    // Build lookup maps for fast in-memory matching
    const emailMap = new Map<string, (typeof existing)[0]>();
    const namePhoneMap = new Map<string, (typeof existing)[0]>();

    for (const contact of existing) {
      if (contact.email) emailMap.set(contact.email.toLowerCase(), contact);
      const namePhoneKey = `${contact.firstName}|${contact.lastName}|${contact.phone || ''}`.toLowerCase();
      namePhoneMap.set(namePhoneKey, contact);
    }

    const newContacts: ImportContactDto[] = [];
    const duplicates: DuplicateRecord[] = [];
    const partialMatches: DuplicateRecord[] = [];

    for (const importRecord of contacts) {
      const emailMatch = importRecord.email
        ? emailMap.get(importRecord.email.toLowerCase())
        : undefined;

      if (emailMatch) {
        duplicates.push({
          importRecord,
          existingId: emailMatch.id,
          existingEmail: emailMatch.email ?? undefined,
          matchReason: 'email',
        });
        continue;
      }

      const namePhoneKey = `${importRecord.firstName}|${importRecord.lastName || ''}|${importRecord.phone || ''}`.toLowerCase();
      const namePhoneMatch = namePhoneMap.get(namePhoneKey);

      if (namePhoneMatch && (importRecord.firstName || importRecord.phone)) {
        partialMatches.push({
          importRecord,
          existingId: namePhoneMatch.id,
          existingEmail: namePhoneMatch.email ?? undefined,
          matchReason: 'name + phone',
        });
        continue;
      }

      newContacts.push(importRecord);
    }

    return { newContacts, duplicates, partialMatches };
  }

  async executeImport(
    contacts: ImportContactDto[],
    duplicateStrategy: 'skip' | 'update' | 'import',
    defaultRole: PersonRole,
    fileType: 'vcf' | 'csv' | 'xlsx',
    tenantId: string,
    userId: string,
  ): Promise<ImportResult> {
    const result: ImportResult = { imported: 0, updated: 0, skipped: 0, errors: [] };

    // Verify userId is a valid User record — gracefully omit ownerId if not found
    // (handles cross-environment JWT in local dev without blocking production imports)
    const userRecord = userId
      ? await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
      : null;
    const validOwnerId = userRecord?.id ?? undefined;

    // Pre-fetch existing contacts for dedup during execute
    const existing = await this.prisma.contact.findMany({
      where: { tenantId },
      select: { id: true, email: true },
    });
    const emailMap = new Map<string, string>();
    for (const c of existing) {
      if (c.email) emailMap.set(c.email.toLowerCase(), c.id);
    }

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      try {
        const existingId = contact.email
          ? emailMap.get(contact.email.toLowerCase())
          : undefined;

        if (existingId) {
          if (duplicateStrategy === 'skip') {
            result.skipped++;
            continue;
          }
          if (duplicateStrategy === 'update') {
            await this.prisma.contact.update({
              where: { id: existingId },
              data: {
                firstName: contact.firstName,
                lastName: contact.lastName || '',
                phone: contact.phone,
                company: contact.company,
                title: contact.title,
                notes: contact.notes,
                primaryRole: contact.primaryRole || defaultRole,
              },
            });
            result.updated++;
            continue;
          }
        }

        await this.prisma.contact.create({
          data: {
            firstName: contact.firstName,
            lastName: contact.lastName || '',
            email: contact.email || '',
            phone: contact.phone,
            company: contact.company,
            title: contact.title,
            notes: contact.notes,
            source: `import:${fileType}`,
            primaryRole: contact.primaryRole || defaultRole,
            tenantId,
            ownerId: validOwnerId,
            assignedToId: validOwnerId,
          },
        });
        result.imported++;
      } catch (error) {
        result.errors.push({ record: i + 1, reason: error.message });
      }
    }

    return result;
  }
}
