import { IsEmail, IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    fullName!: string;

    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;

    @IsOptional()
    @IsString()
    role?: 'admin' | 'user';
}
