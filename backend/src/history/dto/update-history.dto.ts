import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoryDto } from './create-history.dto.js';

export class UpdateHistoryDto extends PartialType(CreateHistoryDto) {}
