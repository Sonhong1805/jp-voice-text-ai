import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('history_items')
export class HistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: string;

  @Column('float')
  score: number;

  @Column('float')
  phoneme: number;

  @Column('float')
  completeness: number;

  @Column('float')
  fluency: number;

  @Column()
  source: string;

  @Column({ type: 'jsonb', nullable: true })
  scoreData: any;

  @CreateDateColumn()
  createdAt: Date;
}
