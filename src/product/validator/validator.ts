export class ReqCreateProduct {
    product_number: string
    product_name: string
    price: number
    stock: number
}

export interface ICreateProduct {
    product_name: string
    product_number: string
    price: number
    stock: number
}

export interface IUpdateProduct {
    product_name?: string
    price?: number
    stock?: number
}