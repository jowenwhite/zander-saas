import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeetingIntelligenceService } from '../meeting-intelligence/meeting-intelligence.service';

interface TwilioRecordingPayload {
  AccountSid: string;
  CallSid: string;
  RecordingSid: string;
  RecordingUrl: string;
  RecordingStatus: 'completed' | 'failed';
  RecordingDuration: string;
  RecordingChannels: string;
  RecordingSource: string;
  RecordingStartTime: string;
}

@Controller('webhooks/twilio')
export class TwilioRecordingWebhookController {
  private readonly logger = new Logger(TwilioRecordingWebhookController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly meetingService: MeetingIntelligenceService,
  ) {}

  /**
   * POST /webhooks/twilio/recording-complete
   * Called by Twilio when a call recording is completed
   */
  @Post('recording-complete')
  @HttpCode(HttpStatus.OK)
  async handleRecordingComplete(@Body() payload: TwilioRecordingPayload) {
    this.logger.log(`Received Twilio recording webhook: ${payload.RecordingSid}`);

    try {
      // Only process completed recordings
      if (payload.RecordingStatus !== 'completed') {
        this.logger.warn(`Recording status not completed: ${payload.RecordingStatus}`);
        return { success: true, message: 'Recording not completed, skipping' };
      }

      // Look up the call in CallLog to get tenant context
      // CallLog uses meetingId field which may store the CallSid
      const callLog = await this.prisma.callLog.findFirst({
        where: {
          meetingId: payload.CallSid,
        },
        include: {
          tenant: true,
          contact: true,
        },
      });

      if (!callLog) {
        this.logger.warn(`No CallLog found for CallSid: ${payload.CallSid}`);
        // Still return success to Twilio to avoid retries
        return { success: true, message: 'CallLog not found' };
      }

      // Check if MeetingRecord already exists for this recording
      const existingMeeting = await this.prisma.meetingRecord.findFirst({
        where: {
          recordingUrl: payload.RecordingUrl,
        },
      });

      if (existingMeeting) {
        this.logger.log(`MeetingRecord already exists for recording: ${payload.RecordingSid}`);
        return { success: true, message: 'Already processed', meetingId: existingMeeting.id };
      }

      // Build attendees from call log contact data
      const attendees = [];
      if (callLog.contact) {
        attendees.push({
          name: `${callLog.contact.firstName || ''} ${callLog.contact.lastName || ''}`.trim() || 'Unknown',
          email: callLog.contact.email || undefined,
          phone: callLog.toNumber || callLog.fromNumber,
          role: 'contact',
        });
      }

      // Create MeetingRecord from the Twilio recording
      // The .mp3 extension ensures we get the MP3 format
      const recordingUrlMp3 = `${payload.RecordingUrl}.mp3`;

      const title = callLog.notes
        ? `Call: ${callLog.notes.substring(0, 50)}`
        : `Call Recording - ${new Date(payload.RecordingStartTime).toLocaleDateString()}`;

      const meetingRecord = await this.meetingService.createFromUrl(
        callLog.tenantId,
        callLog.userId || callLog.tenantId, // Fall back to tenantId if no userId
        {
          recordingUrl: recordingUrlMp3,
          title,
          source: 'twilio',
          platform: 'phone',
          attendees,
          contactId: callLog.contactId || undefined,
        },
      );

      this.logger.log(`Created MeetingRecord ${meetingRecord.id} from Twilio recording ${payload.RecordingSid}`);

      // Update the CallLog with the recording URL
      await this.prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          recordingUrl: recordingUrlMp3,
          duration: parseInt(payload.RecordingDuration, 10) || callLog.duration,
        },
      });

      return {
        success: true,
        message: 'Recording processed',
        meetingId: meetingRecord.id,
      };
    } catch (error) {
      this.logger.error(`Error processing Twilio recording webhook: ${error.message}`, error.stack);
      // Return success to prevent Twilio retries, but log the error
      return { success: false, error: error.message };
    }
  }
}
