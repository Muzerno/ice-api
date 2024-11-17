import { UUID } from "crypto"

export class ICreateCar {
    car_number: string
    key_api?: string
    user_uid?: UUID
}

export class ICreateLine {
    number: string
    car_number: string
    customer_id: number
    car_uuid?: UUID
}