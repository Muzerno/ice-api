export interface IReqCreateWithdraw {
    car_id: number
    user_id: number
    amount: object
    product_id: number[]
    line_id: number
}

export interface ICreateOrderVip {
    car_id: number
    line_id: number
    customer_name: string
    telephone: string
    latitude: string
    longitude: string
    address: string
    note:string
    customer_id: string
}