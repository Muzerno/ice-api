export class ReqCreateUser {
    username: string;
    password?: string;
    telephone: string;
    name: string
}

export interface ICreateUser {
    username: string;
    password?: string;
    telephone: string;
    name: string
}

export interface IUpdateUser {
    username: string;
    password: string;
    telephone: string;
    name: string
}