import { UUID } from "crypto"

export class ICreateCar {
    car_number: string
    key_api?: string
    user_id?: number
}

export class ICreateLine {
    line_name: string
    customer_id: number[]
    car_id?: number
}