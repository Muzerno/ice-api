export class ReqCreateProduct {

    name: string
    price: number
    amount: number
}

export interface ICreateProduct {
    name: string

    price: number
    amount: number
}

export interface IUpdateProduct {
    name?: string
    price?: number
    amount?: number
}