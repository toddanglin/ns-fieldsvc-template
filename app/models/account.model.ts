import { IAccount, IContact, IAddress } from "../interfaces/interfaces.barrel";

export class Account implements IAccount {
    public url: string;
    public description: string;
    public notes: string;
    public id: string; 
    public name: string;
    public phone: string;
    public industry: string;
    public noEmps: number;
    public paymentTerms: string;
    public currency: string;
    public parent: IAccount;
    public isActive: boolean;
    public lastModified: Date;
    public dateCreated: Date;
    public contacts: Array<IContact>;
    public addresses: Array<IAddress>;

    constructor(obj: Account = {} as Account){
        let {
            id = undefined, 
            name = undefined,
            url = undefined,
            description = undefined,
            notes = undefined,
            phone = undefined,
            industry = undefined,
            noEmps = undefined,
            paymentTerms = undefined,
            currency = undefined,
            parent = undefined,
            isActive = true,
            lastModified = undefined,
            dateCreated = undefined,
            contacts = undefined,
            addresses = undefined,
        } = obj;

        /** Account ID (guid) */
        this.id = id;
        /** Account name (string) */
        this.name = name;
        this.url = url;
        this.description = description;
        this.notes = notes;
        /** Primary account phone number (string) */
        this.phone = phone;
        this.industry = industry;
        this.noEmps = noEmps;
        this.paymentTerms = paymentTerms;
        this.currency = currency;
        this.parent = parent;
        this.isActive = isActive;
        this.lastModified = lastModified;
        this.dateCreated = dateCreated;
        this.contacts = contacts;
        this.addresses = addresses;
    }
}