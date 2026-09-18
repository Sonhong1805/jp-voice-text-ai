import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TextsModule } from './texts/texts.module.js';
import { TextEntity } from './texts/entities/text.entity.js';
import { HistoryEntity } from './history/entities/history.entity.js';
import { HistoryModule } from './history/history.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'jp_voice',
      entities: [TextEntity, HistoryEntity],
      synchronize: true, // Only for development
    }),
    TextsModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

