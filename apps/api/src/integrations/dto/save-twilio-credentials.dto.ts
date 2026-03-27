import { IsString, IsNotEmpty } from 'class-validator';

export class SaveTwilioCredentialsDto {
  @IsString()
  @IsNotEmpty({ message: 'Account SID is required' })
  accountSid: string;

  @IsString()
  @IsNotEmpty({ message: 'Auth Token is required' })
  authToken: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone Number is required' })
  phoneNumber: string;
}
