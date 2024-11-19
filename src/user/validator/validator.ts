import { UUID } from "crypto";

export class ReqCreateUser {
    username: string;
    password?: string;
    telephone: string;
    name: string
    role_uuid: UUID
}

export interface ICreateUser {
    username: string;
    password?: string;
    telephone: string;
    name: string
    role_uuid: UUID
}

export interface IUpdateUser {
    username: string;
    password: string;
    telephone: string;
    name: string
    role_uuid: UUID
}