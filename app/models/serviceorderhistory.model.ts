import { IServiceOrderHistory } from "../interfaces/interfaces.barrel";

export class ServiceOrderHistory implements IServiceOrderHistory {
    public id: string;
    public serviceOrderId: string;
    public userId: string;
    public notes: string;
    public isActive: boolean;
    public lastModified: Date;
    public dateCreated: Date;

    constructor(obj: ServiceOrderHistory = {} as ServiceOrderHistory){
        let {
            id = undefined, 
            serviceOrderId = undefined,
            userId = undefined,
            notes = undefined,
            isActive = undefined,
            lastModified = undefined,
            dateCreated = undefined,
        } = obj;

        /** Account ID (guid) */
        this.id = id;
        this.serviceOrderId = serviceOrderId;
        this.userId = userId;
        this.notes = notes;
        this.isActive = isActive;
        this.lastModified = lastModified;
        this.dateCreated = dateCreated;
    }
}