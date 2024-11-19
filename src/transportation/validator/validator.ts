import { UUID } from "crypto"

export class ICreateCar {
    car_number: string
    key_api?: string
    user_uid?: UUID
}

export class ICreateLine {
    customer_uuid: UUID
    car_uuid?: UUID
}