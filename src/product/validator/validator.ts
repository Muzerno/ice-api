export class ReqCreateProduct {
    product_name: string
    price: number
    stock: number
}

export interface ICreateProduct {
    product_name: string
    price: number
    stock: number
}

export interface IUpdateProduct {
    product_name?: string
    price?: number
    stock?: number
}