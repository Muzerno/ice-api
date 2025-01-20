export interface IReqCreateWithdraw {
    car_id: number
    user_id: number
    amount: object
    product_id: number[]
}

export interface ICreateOrderVip {
    car_id: number
    customer_name: string
    telephone: string
    latitude: string
    longitude: string
    address: string
    product_id: number[]
    amount: object
}