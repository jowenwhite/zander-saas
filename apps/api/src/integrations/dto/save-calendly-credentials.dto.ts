import { IsString, IsNotEmpty } from 'class-validator';

export class SaveCalendlyCredentialsDto {
  @IsString()
  @IsNotEmpty({ message: 'API Key is required' })
  apiKey: string;
}
