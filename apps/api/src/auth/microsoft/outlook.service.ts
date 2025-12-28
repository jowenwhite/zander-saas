import { Injectable, Logger } from '@nestjs/common';
import { MicrosoftAuthService } from './microsoft-auth.service';

@Injectable()
export class OutlookService {
  private readonly logger = new Logger(OutlookService.name);
  private readonly graphUrl = 'https://graph.microsoft.com/v1.0';

  constructor(private readonly microsoftAuthService: MicrosoftAuthService) {}

  async getMessages(userId: string, options: { folder?: string; limit?: number; skip?: number } = {}) {
    const accessToken = await this.microsoftAuthService.getValidAccessToken(userId);
    const folder = options.folder || 'inbox';
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    const response = await fetch(
      `${this.graphUrl}/me/mailFolders/${folder}/messages?$top=${limit}&$skip=${skip}&$orderby=receivedDateTime desc`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to get messages: ${error}`);
      throw new Error('Failed to get messages');
    }

    const data = await response.json();
    return data.value;
  }

  async getMessage(userId: string, messageId: string) {
    const accessToken = await this.microsoftAuthService.getValidAccessToken(userId);

    const response = await fetch(`${this.graphUrl}/me/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get message');
    }

    return response.json();
  }

  async sendEmail(userId: string, email: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
  }) {
    const accessToken = await this.microsoftAuthService.getValidAccessToken(userId);

    const message = {
      message: {
        subject: email.subject,
        body: {
          contentType: email.isHtml ? 'HTML' : 'Text',
          content: email.body,
        },
        toRecipients: email.to.map(addr => ({ emailAddress: { address: addr } })),
        ccRecipients: email.cc?.map(addr => ({ emailAddress: { address: addr } })) || [],
        bccRecipients: email.bcc?.map(addr => ({ emailAddress: { address: addr } })) || [],
      },
    };

    const response = await fetch(`${this.graphUrl}/me/sendMail`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to send email: ${error}`);
      throw new Error('Failed to send email');
    }

    return { success: true };
  }

  async createDraft(userId: string, email: {
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
  }) {
    const accessToken = await this.microsoftAuthService.getValidAccessToken(userId);

    const message = {
      subject: email.subject,
      body: {
        contentType: email.isHtml ? 'HTML' : 'Text',
        content: email.body,
      },
      toRecipients: email.to.map(addr => ({ emailAddress: { address: addr } })),
      ccRecipients: email.cc?.map(addr => ({ emailAddress: { address: addr } })) || [],
    };

    const response = await fetch(`${this.graphUrl}/me/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to create draft: ${error}`);
      throw new Error('Failed to create draft');
    }

    return response.json();
  }

  async replyToEmail(userId: string, messageId: string, reply: {
    body: string;
    isHtml?: boolean;
    replyAll?: boolean;
  }) {
    const accessToken = await this.microsoftAuthService.getValidAccessToken(userId);
    const endpoint = reply.replyAll ? 'replyAll' : 'reply';

    const response = await fetch(`${this.graphUrl}/me/messages/${messageId}/${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          body: {
            contentType: reply.isHtml ? 'HTML' : 'Text',
            content: reply.body,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to reply: ${error}`);
      throw new Error('Failed to reply to email');
    }

    return { success: true };
  }

  async moveToFolder(userId: string, messageId: string, folderId: string) {
    const accessToken = await this.microsoftAuthService.getValidAccessToken(userId);

    const response = await fetch(`${this.graphUrl}/me/messages/${messageId}/move`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destinationId: folderId }),
    });

    if (!response.ok) {
      throw new Error('Failed to move message');
    }

    return response.json();
  }

  async deleteMessage(userId: string, messageId: string) {
    const accessToken = await this.microsoftAuthService.getValidAccessToken(userId);

    const response = await fetch(`${this.graphUrl}/me/messages/${messageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to delete message');
    }

    return { success: true };
  }

  async getMailFolders(userId: string) {
    const accessToken = await this.microsoftAuthService.getValidAccessToken(userId);

    const response = await fetch(`${this.graphUrl}/me/mailFolders`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get mail folders');
    }

    const data = await response.json();
    return data.value;
  }
}
