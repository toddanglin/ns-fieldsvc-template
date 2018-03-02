import { IBaseObject } from "./base";
import { IServiceOrderHistory } from "./serviceorderhistory";

export interface IServiceOrder extends IBaseObject {
    accountId: string;
    contactId: string;
    assignedToId: string;
    incidentType: string;
    serviceType: string;
    locationType: string;
    severity: string;
    estimatedArrival: Date;
    estimatedDuration: number;
    actualArrival: Date;
    departureTime: Date;
    actualDuration: number;
    signatureImageId: string;
    signatureImageUrl: string;
    isComplete: boolean; 
    history: Array<IServiceOrderHistory>;
}