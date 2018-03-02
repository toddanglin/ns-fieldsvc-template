import { IBaseObject } from "./base";
import { IContact } from "./contact";
import { IAddress } from "./address";

export interface IAccount extends IBaseObject {
    name: string;
    url: string;
    description: string;
    phone: string;
    notes: string;
    industry: string;
    noEmps: number;
    paymentTerms: string;
    currency: string;
    parent: IAccount;
    contacts: Array<IContact>;
    addresses: Array<IAddress>;
}