import { IServiceOrder, IServiceOrderHistory } from "../interfaces/interfaces.barrel";

export class ServiceOrder implements IServiceOrder {
    public accountId: string;
    public contactId: string;
    public assignedToId: string;
    public incidentType: string;
    public serviceType: string;
    public locationType: string;
    public severity: string;
    public estimatedArrival: Date;
    public estimatedDuration: number;
    public actualArrival: Date;
    public departureTime: Date;
    public signatureImageId: string;
    public signatureImageUrl: string;
    public isComplete: boolean;
    public id: string;
    public isActive: boolean;
    public lastModified: Date;
    public dateCreated: Date;
    public history: Array<IServiceOrderHistory>;

    public get actualDuration(): number {
        // Actual duration in MINUTES
        if (this.departureTime === undefined || this.actualArrival === undefined) return 0;

        return Math.floor((this.departureTime.getTime() - this.actualArrival.getTime()) / 86400000); // Return difference in minutes
    }
    
    constructor(obj: ServiceOrder = {} as ServiceOrder){
        let {
            id = undefined, 
            accountId = undefined,
            contactId = undefined,
            assignedToId = undefined,
            incidentType = undefined,
            serviceType = undefined,
            locationType = undefined,
            severity = undefined,
            estimatedArrival = undefined,
            estimatedDuration = undefined,
            actualArrival = undefined,
            departureTime = undefined,
            signatureImageId = undefined,
            signatureImageUrl = undefined,
            isComplete = undefined,
            isActive = undefined,
            lastModified = undefined,
            dateCreated = undefined,
            history = undefined
        } = obj;

        /** ID (guid) */
        this.id = id;
        this.accountId = accountId;
        this.contactId = contactId;
        this.assignedToId = assignedToId;
        this.incidentType = incidentType;
        this.serviceType = serviceType;
        this.locationType = locationType;
        this.severity = severity;
        this.estimatedArrival = estimatedArrival;
        this.estimatedDuration = estimatedDuration;
        this.actualArrival = actualArrival;
        this.departureTime = departureTime;
        this.signatureImageId = signatureImageId;
        this.signatureImageUrl = signatureImageUrl;
        this.isComplete = isComplete;
        this.isActive = isActive;
        this.lastModified = lastModified;
        this.dateCreated = dateCreated;
        this.history = history;
    }
}