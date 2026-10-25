import { PartialType } from '@nestjs/mapped-types';
import { CreateBusDto } from './create-bus.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBusDto extends PartialType(CreateBusDto) {
  @IsOptional()
  @IsString()
  id?: string;
}