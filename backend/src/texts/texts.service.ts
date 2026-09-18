import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextEntity } from './entities/text.entity.js';

@Injectable()
export class TextsService {
  constructor(
    @InjectRepository(TextEntity)
    private textsRepository: Repository<TextEntity>,
  ) {}

  async create(content: string) {
    const newText = this.textsRepository.create({ content });
    return this.textsRepository.save(newText);
  }

  findAll() {
    return this.textsRepository.find({ order: { created_at: 'DESC' } });
  }

  findOne(id: number) {
    return this.textsRepository.findOneBy({ id });
  }
}
