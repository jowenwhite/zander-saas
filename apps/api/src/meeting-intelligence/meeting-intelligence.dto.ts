import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
  IsNumber,
} from 'class-validator';

export class UploadMeetingDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsOptional()
  platform?: string; // 'google_meet', 'zoom', 'phone', 'in_person'

  @IsString()
  @IsOptional()
  attendees?: string; // JSON string: [{name, email, role}]

  @IsString()
  @IsOptional()
  engagementId?: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  contactId?: string;

  @IsString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsOptional()
  calendarEventId?: string;
}

export class CreateFromUrlDto {
  @IsString()
  @IsNotEmpty({ message: 'Recording URL is required' })
  recordingUrl: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  attendees?: string;

  @IsString()
  @IsOptional()
  engagementId?: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  contactId?: string;
}

export class UpdateMeetingDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  attendees?: string;

  @IsString()
  @IsOptional()
  engagementId?: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  contactId?: string;

  @IsString()
  @IsOptional()
  platform?: string;
}

export class ShareMeetingSummaryDto {
  @IsArray()
  @IsNotEmpty({ message: 'Recipients are required' })
  recipients: { name: string; email: string }[];
}

export interface MeetingSummary {
  keyDecisions: { decision: string; context: string }[];
  actionItems: { item: string; owner: string; dueDate: string }[];
  followUps: { item: string; responsible: string; timeframe: string }[];
  clientConcerns: { concern: string; severity: string; response: string }[];
  nextSteps: { step: string; owner: string; timeline: string }[];
  topicsSummary: string;
  meetingEffectiveness: string;
}

export interface SpeakerSegment {
  speaker: string;
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  speakers?: SpeakerSegment[];
  provider: 'whisper' | 'assemblyai';
}
