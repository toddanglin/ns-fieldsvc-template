import { IBaseObject } from "./base";

export interface IAddress extends IBaseObject {
    street1: string,
    street2: string,
    city: string,
    state: string,
    postalcode: string,
    latitude: number,
    longitude: number,
    description: string,
    accountId: string
    isPrimary: boolean;
}