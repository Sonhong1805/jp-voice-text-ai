import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryEntity } from './entities/history.entity.js';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(HistoryEntity)
    private historyRepository: Repository<HistoryEntity>,
  ) {}

  async create(createHistoryDto: any): Promise<HistoryEntity> {
    const historyItem = new HistoryEntity();
    Object.assign(historyItem, createHistoryDto);
    historyItem.date = new Date().toLocaleTimeString('vi-VN');
    return this.historyRepository.save(historyItem);
  }

  async findAll(): Promise<HistoryEntity[]> {
    return this.historyRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async remove(id: string): Promise<void> {
    const item = await this.historyRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`History item with ID ${id} not found`);
    }
    await this.historyRepository.remove(item);
  }

  async clearAll(): Promise<void> {
    await this.historyRepository.clear();
  }
}
