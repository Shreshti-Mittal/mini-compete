import {
  IsString,
  IsArray,
  IsInt,
  IsDateString,
  MinLength,
  Min,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';

export class CreateCompetitionDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsInt()
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity: number;

  @IsDateString({}, { message: 'Registration deadline must be a valid date' })
  regDeadline: string;
}

