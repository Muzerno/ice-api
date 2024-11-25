import { Column, Entity } from "typeorm";
import { FactoryTemplate } from "./factory.template";

@Entity({ name: "drop_off_point" })
export class DropOffPoint extends FactoryTemplate {

    @Column()
    drop_no: number;

    @Column()
    status: boolean;

    @Column()
    latitude: string;

    @Column()
    longitude: string;
}