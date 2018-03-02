import { IServiceTerritory } from "../interfaces/interfaces.barrel";

export class ServiceTerritory implements IServiceTerritory {
    public name: string;
    public id: string;
    public isActive: boolean;
    public lastModified: Date;
    public dateCreated: Date;

    constructor(obj: ServiceTerritory = {} as ServiceTerritory){
        let {
            id = undefined, 
            name = undefined,
            isActive = undefined,
            lastModified = undefined,
            dateCreated = undefined,
        } = obj;

        /** Account ID (guid) */
        this.id = id;
        this.name = name;
        this.isActive = isActive;
        this.lastModified = lastModified;
        this.dateCreated = dateCreated;
    }
}