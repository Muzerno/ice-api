import { UUID } from "crypto";

export class ReqCreateUser {
    username: string;
    password?: string;
    telephone: string;
    firstname: string
    lastname: string
    role_id: number
    address: string
}

export interface ICreateUser {
    username: string;
    password?: string;
    telephone: string;
    firstname: string
    lastname: string
    role_id: number
    address: string
}

export interface IUpdateUser {
    username: string;
    password: string;
    telephone: string;
    firstname: string
    lastname: string
    role_id: number
    address: string
}