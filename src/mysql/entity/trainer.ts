import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Pokemon } from '../../types/pokemon.types';
import { Badge } from './badge';

@Entity()
export class Trainer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  class!: string;

  @Column({ type: 'json', nullable: true })
  badges!: Badge[];

  @Column({ type: 'json', nullable: true })
  pokemon!: Pokemon[];
}
