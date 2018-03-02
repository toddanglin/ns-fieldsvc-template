import { IAccount, IAddress } from "../interfaces/interfaces.barrel";

export class Address implements IAddress {
    public id: string;
    public street1: string;
    public street2: string;
    public city: string;
    public state: string;
    public postalcode: string;
    public latitude: number;
    public longitude: number;
    public description: string;
    public accountId: string;
    public isPrimary: boolean;
    public isActive: boolean;
    public lastModified: Date;
    public dateCreated: Date;

    constructor(obj: Address = {} as Address){
        let {
            id = undefined, 
            street1 = undefined,
            street2 = undefined,
            city = undefined,
            state = undefined,
            postalcode = undefined,
            latitude = undefined,
            longitude = undefined,
            description = undefined,
            accountId = undefined,
            isActive = undefined,
            lastModified = undefined,
            dateCreated = undefined,
            isPrimary = undefined,
        } = obj;

        /** Account ID (guid) */
        this.id = id;
        this.street1 = street1;
        this.street2 = street2;
        this.city = city;
        this.state = state;
        this.postalcode = postalcode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;
        this.accountId = accountId;
        this.isActive = isActive;
        this.lastModified = lastModified;
        this.dateCreated = dateCreated;
        this.isPrimary = isPrimary;
    }
}