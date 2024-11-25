import { UUID } from "crypto";
import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity()
export class FactoryTemplate {
    @PrimaryGeneratedColumn("increment")
    id: number
}