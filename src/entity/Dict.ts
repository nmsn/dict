import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Dict {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  query: string;

  @Column()
  translation: string;

  @Column()
  type: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  time: Date;
}
