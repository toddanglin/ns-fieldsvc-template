import { IBaseObject } from "./base";

export interface IServiceOrderHistory extends IBaseObject {
    serviceOrderId: string,
    userId: string,
    notes: string
}