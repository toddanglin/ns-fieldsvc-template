import { IAccount, IContact } from "../interfaces/interfaces.barrel";

export class Contact implements IContact {
    public id: string; 
    public firstName: string;
    public lastName: string;
    public email: string;
    public phone: string;
    public sms: string;
    public title: string;
    public accountId: string;
    public isActive: boolean;
    public lastModified: Date;
    public dateCreated: Date;
    public isPrimary: boolean;

    constructor(obj: Contact = {} as Contact){
        let {
            id = undefined, 
            firstName = undefined,
            lastName = undefined,
            email = undefined,
            phone = undefined,
            sms = undefined,
            title = undefined,
            accountId = undefined,
            isActive = undefined,
            lastModified = undefined,
            dateCreated = undefined,
            isPrimary = undefined,
        } = obj;

        /** Account ID (guid) */
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.sms = sms;
        this.title = title;
        this.accountId = accountId;
        this.isActive = isActive;
        this.lastModified = lastModified;
        this.dateCreated = dateCreated;
        this.isPrimary = isPrimary;
    }
}