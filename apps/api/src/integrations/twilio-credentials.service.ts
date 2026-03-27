import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioCredentialsService {
  private readonly logger = new Logger(TwilioCredentialsService.name);

  constructor(private prisma: PrismaService) {}

  async getCredentials(tenantId: string) {
    return this.prisma.twilioCredential.findUnique({
      where: { tenantId },
    });
  }

  async saveCredentials(
    tenantId: string,
    data: { accountSid: string; authToken: string; phoneNumber: string },
  ) {
    // Validate credentials by attempting to create a client
    try {
      const client = Twilio.default(data.accountSid, data.authToken);
      // Test the credentials by fetching account info
      await client.api.accounts(data.accountSid).fetch();
      this.logger.log(`Twilio credentials validated for tenant: ${tenantId}`);
    } catch (error) {
      this.logger.error(`Invalid Twilio credentials: ${error.message}`);
      throw new Error('Invalid Twilio credentials. Please verify your Account SID and Auth Token.');
    }

    return this.prisma.twilioCredential.upsert({
      where: { tenantId },
      update: {
        accountSid: data.accountSid,
        authToken: data.authToken,
        phoneNumber: data.phoneNumber,
      },
      create: {
        tenantId,
        accountSid: data.accountSid,
        authToken: data.authToken,
        phoneNumber: data.phoneNumber,
      },
    });
  }

  async deleteCredentials(tenantId: string) {
    try {
      await this.prisma.twilioCredential.delete({
        where: { tenantId },
      });
      return { success: true };
    } catch (error) {
      this.logger.warn(`No Twilio credentials to delete for tenant: ${tenantId}`);
      return { success: false, error: 'No credentials found' };
    }
  }

  async getStatus(tenantId: string) {
    const credentials = await this.getCredentials(tenantId);
    return {
      connected: !!credentials,
      phoneNumber: credentials?.phoneNumber || null,
      connectedAt: credentials?.createdAt || null,
    };
  }

  async getTwilioClient(tenantId: string): Promise<Twilio.Twilio | null> {
    const credentials = await this.getCredentials(tenantId);
    if (!credentials) {
      // Fall back to environment variables
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      if (accountSid && authToken && accountSid !== 'your_account_sid_here') {
        return Twilio.default(accountSid, authToken);
      }
      return null;
    }
    return Twilio.default(credentials.accountSid, credentials.authToken);
  }

  async getFromNumber(tenantId: string): Promise<string | null> {
    const credentials = await this.getCredentials(tenantId);
    if (credentials) {
      return credentials.phoneNumber;
    }
    // Fall back to environment variable
    return process.env.TWILIO_PHONE_NUMBER || null;
  }
}
