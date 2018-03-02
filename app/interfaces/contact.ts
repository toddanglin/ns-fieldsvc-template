import { IBaseObject } from "./base";

export interface IContact extends IBaseObject {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    sms: string,
    title: string,
    accountId: string
    isPrimary: boolean;
}