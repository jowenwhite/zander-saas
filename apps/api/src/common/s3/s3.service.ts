import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private region: string;

  private s3Configured: boolean;

  /**
   * Check if S3 is explicitly configured via environment variable.
   * Does NOT rely on SDK credential chain - only explicit S3_BUCKET_NAME config.
   */
  isConfigured(): boolean {
    return this.s3Configured;
  }

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';

    // CRITICAL: Require ALL THREE env vars before considering S3 configured
    // Do NOT rely on SDK credential chain or IAM task roles
    const explicitBucket = this.configService.get<string>('S3_BUCKET_NAME');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    this.s3Configured = !!(explicitBucket && accessKeyId && secretAccessKey);
    this.bucketName = explicitBucket || 'zander-assets';

    if (this.s3Configured) {
      // Only initialize S3 client if ALL credentials explicitly configured
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: accessKeyId!,
          secretAccessKey: secretAccessKey!,
        },
      });

      this.logger.log(`S3 configured with bucket: ${this.bucketName}`);
    } else {
      const missing: string[] = [];
      if (!explicitBucket) missing.push('S3_BUCKET_NAME');
      if (!accessKeyId) missing.push('AWS_ACCESS_KEY_ID');
      if (!secretAccessKey) missing.push('AWS_SECRET_ACCESS_KEY');
      this.logger.warn(`S3 disabled - missing env vars: ${missing.join(', ')}. Using database storage fallback.`);
    }
  }

  /**
   * Upload a file to S3
   * @param tenantId - Tenant ID for path organization
   * @param folder - Folder name (Logos, Images, Documents, Templates)
   * @param buffer - File buffer
   * @param filename - Original filename
   * @param mimeType - File MIME type
   */
  async uploadFile(
    tenantId: string,
    folder: string,
    buffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<UploadResult> {
    // Check if S3 is explicitly configured
    if (!this.s3Configured || !this.s3Client) {
      throw new Error(
        'S3 storage not configured: S3_BUCKET_NAME environment variable is required',
      );
    }

    // Sanitize filename
    const sanitizedFilename = this.sanitizeFilename(filename);
    const timestamp = Date.now();
    const key = `${tenantId}/${folder}/${timestamp}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // Public read access for assets
      ACL: 'public-read',
    });

    try {
      await this.s3Client.send(command);
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        url,
        key,
        bucket: this.bucketName,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   * @param key - S3 object key
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.s3Client) {
      this.logger.warn('S3 not configured - cannot delete file');
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if a file exists in S3
   * @param key - S3 object key
   */
  async fileExists(key: string): Promise<boolean> {
    if (!this.s3Client) {
      return false;
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract S3 key from URL
   * @param url - Full S3 URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Remove leading slash
      return urlObj.pathname.substring(1);
    } catch {
      return null;
    }
  }

  /**
   * Sanitize filename for safe S3 storage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }
}
