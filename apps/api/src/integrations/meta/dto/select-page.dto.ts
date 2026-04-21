import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SelectPageDto {
  @IsString()
  @IsNotEmpty({ message: 'Page ID is required' })
  pageId: string;

  @IsString()
  @IsNotEmpty({ message: 'Page name is required' })
  pageName: string;

  @IsString()
  @IsNotEmpty({ message: 'Page access token is required' })
  pageAccessToken: string;

  @IsString()
  @IsOptional()
  instagramAccountId?: string;

  @IsString()
  @IsOptional()
  instagramUsername?: string;
}
