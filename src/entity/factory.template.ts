import { UUID } from "crypto";
import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity()
export class FactoryTemplate {
    @PrimaryGeneratedColumn("uuid")
    uuid:UUID
    
    @Column({type:"timestamp", nullable:true})
    create_at:Timestamp

    @Column({type:"timestamp",nullable:true})
    update_at:Timestamp

    @Column({type:"enum",enum:["ACTIVE","ARCHIVED","PENDING"],default:"ACTIVE"})
    status:string

    @Column({nullable:true})
    create_by:string

    @Column({nullable:true})
    update_by:string

    @Column({nullable:true})
    archive_by:string
}