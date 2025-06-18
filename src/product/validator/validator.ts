export class ReqCreateProduct {
    ice_id: string
    name: string
    price: number
    amount: number
}

export interface ICreateProduct {
    ice_id: string
    name: string
    price: number
    amount: number
}

export interface IUpdateProduct {
    ice_id?: string
    name?: string
    price?: number
    amount?: number
}