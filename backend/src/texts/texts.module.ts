import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextsService } from './texts.service.js';
import { TextsController } from './texts.controller.js';
import { TextEntity } from './entities/text.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([TextEntity])],
  controllers: [TextsController],
  providers: [TextsService],
})
export class TextsModule {}
