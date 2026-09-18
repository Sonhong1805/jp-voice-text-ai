import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TextsService } from './texts.service.js';

@Controller('texts')
export class TextsController {
  constructor(private readonly textsService: TextsService) {}

  @Post()
  create(@Body('content') content: string) {
    return this.textsService.create(content);
  }

  @Get()
  findAll() {
    return this.textsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.textsService.findOne(+id);
  }
}
