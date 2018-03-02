import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";

import { Account, Contact, Address, ServiceTerritory, ServiceOrder, ServiceOrderHistory } from "../models/models.barrel";

import * as faker from "faker";

// Use this service to generate demo data for this app and upsert it into Kinvey
// data collections. Since demo app is "date sensitive" (shows work orders for "today"),
// generating data dyanmically ensures dates are always current
@Injectable()
export class GenerateDataService {
        private acctDataStore: Kinvey.CacheStore<Kinvey.Entity>;
        private contactDataStore: Kinvey.CacheStore<Kinvey.Entity>;
        private addrDataStore: Kinvey.CacheStore<Kinvey.Entity>;
        private territoryDataStore: Kinvey.CacheStore<Kinvey.Entity>;
        private serviceOrderDataStore: Kinvey.CacheStore<Kinvey.Entity>;
        private serviceOrderHistoryDataStore: Kinvey.CacheStore<Kinvey.Entity>;
        private usersCache: Array<Kinvey.User>;

        constructor() {
            console.log("GenerateDataService Init");
        }

        public generateDemoData = ():Promise<void> => {
            let accounts: Array<Account>;
            let territories: Array<ServiceTerritory>;
            let users: Array<Kinvey.User>;
            let orders: Array<ServiceOrder>;

            this.usersCache = new Array<Kinvey.User>();

            return new Promise((resolve, reject) => {
                // Create a default/dummy usera
               this.generateUsers()
                    .then(result => {
                        users = result;

                        // Make sure the last demo user is current authenticated
                        if (Kinvey.User.getActiveUser().username !== users[users.length - 1].username) { 
                            return Kinvey.User.login(users[users.length - 1].username, "demo");
                        } else {
                            return Kinvey.User.getActiveUser();
                        }
                    })
                    .then(result => {
                        console.log("Active Demo User", result.username);

                        this.initDataStores();

                        // Create some demo accounts
                        return this.generateAccounts()
                    })
                    .then(result => {
                        // Generate some contacts
                        accounts = result;

                        return this.generateContacts(accounts);
                    })
                    .then(result => {
                        // Add the contacts to the accounts
                        accounts.forEach((a, i) => {
                            accounts[i].contacts = new Array<Contact>();
                            result.forEach(contact => {
                                if (a.id === contact.accountId) {
                                    accounts[i].contacts.push(contact);
                                }
                            })
                        });

                        // Generate some addresses
                        return this.generateAddresses(accounts);
                    })
                    .then(result => {
                        // Add the addresses to the accounts
                        accounts.forEach((a, i) => {
                            accounts[i].addresses = new Array<Address>();
                            result.forEach(addr => {
                                if (a.id === addr.accountId) {
                                    accounts[i].addresses.push(addr);
                                }
                            })
                        });

                        // Generate some service territories
                        return this.generateServiceTerritories();
                    })
                    .then(result => {
                        territories = result;

                        // Generate some service orders
                        return this.generateServiceOrders(accounts, users);
                    })
                    .then(result => {
                        // Generate some service order history
                        orders = result;

                        return this.generateServiceOrderHistory(orders, users);
                    })
                    .then(() => {
                        // Clean-up local data store caches
                        return this.disposeDataStores();
                    })
                    .then(() => {
                        // Logout of the demo account so user can login manually
                        return Kinvey.User.logout();
                    })
                    .then(() => {
                        console.log("Demo data successfully generated.");
                        resolve();
                    })
                    .catch(err => {
                        console.warn("OhNoes! Something went wrong.", err);
                        reject();
                    });
            });
        }

        private generateUsers = ():Promise<Array<Kinvey.User>> => {
            let users = new Array<Kinvey.User>();

            return new Promise((resolve, reject) => {
                console.log("Attempt to generate users for the demo...");
                
                 //Create three fake users
                let user1 = new Kinvey.User({ 
                    username: "techjoe@quantum.com",
                    email: "techjoe@quantum.com"
                });
                user1.data["first_name"] = "Joe";
                user1.data["last_name"] = "Holland";
                user1.data["photoUrl"] = "https://s3.amazonaws.com/uifaces/faces/twitter/wim1k/128.jpg"; // Random/fake avatar URL
                users.push(user1);

                let user2 = new Kinvey.User({ 
                    username: "techjane@quantum.com",
                    email: "techjane@quantum.com"
                });
                user2.data["first_name"] = "Jane";
                user2.data["last_name"] = "Satrom";
                user2.data["photoUrl"] = "https://s3.amazonaws.com/uifaces/faces/twitter/m_kalibry/128.jpg"; // TODO
                users.push(user2);

                let user3 = new Kinvey.User({ 
                    username: "techster@quantum.com",
                    email: "techster@quantum.com"
                });
                user3.data["first_name"] = "Todd";
                user3.data["last_name"] = "Anglin";
                user3.data["photoUrl"] = "https://s3.amazonaws.com/uifaces/faces/twitter/herbigt/128.jpg"; // TODO
                users.push(user3);

                this.forEachPromise(users, this.saveUser)
                    .then(result => {
                        console.log("Users successfully created!");
                        console.log("Current User", Kinvey.User.getActiveUser().username);

                        resolve(this.usersCache);
                    })
                    .catch(err => {
                        console.warn("Error saving demo user accounts", err);
                        reject(err);
                    });
            });
        }

        private generateAccounts = ():Promise<Array<Account>> => {
            let accounts = new Array<Account>();
            

            return new Promise((resolve, reject) => {
                // Clear any existing demo data
                // let query = new Kinvey.Query();
                console.log("Attempt to generate account entities...");
                this.acctDataStore.sync()
                    .then(() => {
                        return this.acctDataStore.remove();
                    })
                    .then(result => {
                        console.log("Remove Success", result.count);
                        let promises = new Array<Promise<Kinvey.Entity>>();

                        for (let i = 0; i < 10; i++) {
                            let newAcct = new Account();
            
                            newAcct.id = faker.random.uuid();
                            if (i === 3) {
                                newAcct.parent = accounts[0];
                            }
                            newAcct.name = faker.company.companyName();
                            newAcct.phone = faker.phone.phoneNumber("##########");
                            newAcct.url = faker.internet.domainName();
                            newAcct.description = faker.company.catchPhrase();
                            newAcct.notes = faker.lorem.paragraph();
                            let empCnt = faker.random.number(1000);
                            newAcct.noEmps = (empCnt > 50) ? Math.round(empCnt / 100) * 100 : 50;
                            newAcct.paymentTerms = faker.random.arrayElement(['Net15','Net30','Net60',undefined]);
                            newAcct.currency = faker.random.arrayElement(['USD','EUR']);
                            newAcct.industry = faker.random.arrayElement(['Finance','Healthcare','Manufacturing','Agriculture','Pharma','Retail','Construction','Insurace','Transport']);
                            newAcct.dateCreated = faker.date.between("2005-01-01","2016-12-31");
                            newAcct.lastModified = faker.date.recent();
                            newAcct.isActive = true;
            
                            console.log(JSON.stringify(newAcct));
            
                            accounts.push(newAcct);
                        }

                        let entities = new Array<any>();
                        accounts.forEach(acct => {
                            // Map the Account object to Kinvey column names
                            let e = {
                                _id: acct.id,
                                account_name: acct.name,
                                website_url: acct.url,
                                description: acct.description,
                                account_notes: acct.notes, 
                                main_phone: acct.phone,
                                industry: acct.industry,
                                no_emps: acct.noEmps,
                                payment_terms: acct.paymentTerms,
                                currency: acct.currency,
                                is_active: acct.isActive,
                                parent_account_id: (acct.parent) ? acct.parent.id : undefined,
                            }
                            entities.push(e);
                        });

                        this.forEachPromise(entities, this.saveEntity, this.acctDataStore)
                            .then(result => {
                                console.log("Demo Accounts created!");
                                resolve(accounts);
                            })
                            .catch(err => {
                                console.warn("Error saving accounts", err);
                                reject(err);
                            });
                    })
                    .catch(err => {
                        console.warn("Oops! Something went wrong clearing the 'account' collection", err);
                        reject(err);
                    });
            });
        }

        private generateContacts = (accounts: Array<Account>):Promise<Array<Contact>> => {
            let contacts = new Array<Contact>();
            

            return new Promise((resolve, reject) => {
                // Clear any existing demo data
                // let query = new Kinvey.Query();
                console.log("Attempt to generate contact entities...");
                this.contactDataStore.sync()
                    .then(() => {
                        return this.contactDataStore.remove();
                    })
                    .then(result => {
                        console.log("Remove Success", result.count);
                        let promises = new Array<Promise<Kinvey.Entity>>();

                        accounts.forEach((a) => {
                            // How many contacts? Make it random
                            let totalContacts = this.randomIntFromInterval(1,3);

                            for (let i = 0; i < totalContacts; i++) {
                                let newContact = new Contact();
                
                                newContact.id = faker.random.uuid();
                                newContact.firstName = faker.name.firstName();
                                newContact.lastName = faker.name.lastName();
                                newContact.title = faker.name.jobTitle();
                                newContact.email = faker.internet.email();
                                newContact.phone = faker.phone.phoneNumber("##########");
                                newContact.sms = faker.phone.phoneNumber("##########");
                                newContact.accountId = a.id; // Link to the parent account
                                newContact.isActive = true;
                                newContact.isPrimary = (i === 0) ? true : false;
                
                                console.log(JSON.stringify(newContact));
                
                                contacts.push(newContact);
                            }
                        });

                        let entities = new Array<any>();
                        contacts.forEach(contact => {
                            // Map the Account object to Kinvey column names
                            let e = {
                                _id: contact.id,
                                account_id: contact.accountId,
                                first_name: contact.firstName,
                                last_name: contact.lastName,
                                primary_email: contact.email,
                                primary_phone: contact.phone,
                                sms_phone: contact.sms,
                                title: contact.title,
                                is_active: contact.isActive,
                                is_primary: contact.isPrimary,
                            }
                            entities.push(e);
                        });

                        this.forEachPromise(entities, this.saveEntity, this.contactDataStore)
                            .then(result => {
                                console.log("Demo Contacts created!");
                                resolve(contacts);
                            })
                            .catch(err => {
                                console.warn("Error saving contacts", err);
                                reject(err);
                            });
                    })
                    .catch(err => {
                        console.warn("Oops! Something went wrong clearing the 'contact' collection", err);
                        reject(err);
                    });
            });
        }

        private generateAddresses = (accounts: Array<Account>):Promise<Array<Address>> => {
            let addresses = new Array<Address>();

            return new Promise((resolve, reject) => {
                // Clear any existing demo data
                // let query = new Kinvey.Query();
                console.log("Attempt to generate address entities...");
                this.addrDataStore.sync()
                    .then(() => {
                        return this.addrDataStore.remove();
                    })
                    .then(result => {
                        console.log("Remove Success", result.count);
                        let promises = new Array<Promise<Kinvey.Entity>>();

                        accounts.forEach((a) => {
                            // How many contacts? Make it random
                            let totalAddresses = this.randomIntFromInterval(1,2);

                            for (let i = 0; i < totalAddresses; i++) {
                                let newAddr = new Address();
                
                                newAddr.id = faker.random.uuid();
                                newAddr.description = faker.lorem.sentence();
                                newAddr.street1 = faker.address.streetAddress();
                                newAddr.street2 = (this.coinFlip()) ? faker.address.secondaryAddress() : undefined;
                                newAddr.city = faker.address.city();
                                newAddr.state = faker.address.stateAbbr();
                                newAddr.postalcode = faker.address.zipCode();
                                newAddr.latitude = faker.address.latitude();
                                newAddr.longitude = faker.address.longitude();
                                newAddr.isActive = true;
                                newAddr.isPrimary = (i === 0) ? true : false;
                                newAddr.accountId = a.id; // Link to account
                
                                console.log(JSON.stringify(newAddr));
                
                                addresses.push(newAddr);
                            }
                        });

                        let entities = new Array<any>();
                        addresses.forEach(addr => {
                            // Map the Account object to Kinvey column names
                            let e = {
                                _id: addr.id,
                                account_id: addr.accountId,
                                street1: addr.street1,
                                street2: addr.street2,
                                city: addr.city,
                                state: addr.state,
                                postalcode: addr.postalcode,
                                latitude: addr.latitude,
                                longitude: addr.longitude,
                                description: addr.description,
                                is_active: addr.isActive,
                                is_primary: addr.isPrimary,
                            }
                            entities.push(e);
                        });

                        this.forEachPromise(entities, this.saveEntity, this.addrDataStore)
                            .then(result => {
                                console.log("Demo Addresses created!");
                                resolve(addresses);
                            })
                            .catch(err => {
                                console.warn("Error saving addresses", err);
                                reject(err);
                            });
                    })
                    .catch(err => {
                        console.warn("Oops! Something went wrong clearing the 'address' collection", err);
                        reject(err);
                    });
            });
        }

        private generateServiceTerritories = ():Promise<Array<ServiceTerritory>> => {
            let territories = new Array<ServiceTerritory>();

            return new Promise((resolve, reject) => {
                // Clear any existing demo data
                // let query = new Kinvey.Query();
                console.log("Attempt to generate service territory entities...");
                this.territoryDataStore.sync()
                    .then(() => {
                        return this.territoryDataStore.remove();
                    })
                    .then(result => {
                        console.log("Remove Success", result.count);
                        let promises = new Array<Promise<Kinvey.Entity>>();

                        territories.push(new ServiceTerritory({ id: `${ faker.random.uuid() }`, name: "North", isActive: true, lastModified: new Date(), dateCreated: new Date() }));
                        territories.push(new ServiceTerritory({ id: `${ faker.random.uuid() }`, name: "South", isActive: true, lastModified: new Date(), dateCreated: new Date() }));
                        territories.push(new ServiceTerritory({ id: `${ faker.random.uuid() }`, name: "East", isActive: true, lastModified: new Date(), dateCreated: new Date() }));
                        territories.push(new ServiceTerritory({ id: `${ faker.random.uuid() }`, name: "West", isActive: true, lastModified: new Date(), dateCreated: new Date() }));

                        let entities = new Array<any>();
                        territories.forEach(t => {
                            // Map the Account object to Kinvey column names
                            let e = {
                                _id: t.id,
                                name: t.name,
                                is_active: t.isActive,
                            }
                            entities.push(e);
                        });

                        this.forEachPromise(entities, this.saveEntity, this.territoryDataStore)
                            .then(result => {
                                console.log("Demo Territories created!");
                                resolve(territories);
                            })
                            .catch(err => {
                                console.warn("Error saving territories", err);
                                reject(err);
                            });
                    })
                    .catch(err => {
                        console.warn("Oops! Something went wrong clearing the 'territories' collection", err);
                        reject(err);
                    });
            });
        }

        private generateServiceOrders = (accounts: Array<Account>, users: Array<Kinvey.User>):Promise<Array<ServiceOrder>> => {
            let orders = new Array<ServiceOrder>();
            
            return new Promise((resolve, reject) => {
                // Clear any existing demo data
                // let query = new Kinvey.Query();
                console.log("Attempt to generate service order entities...");
                this.serviceOrderDataStore.sync()
                    .then(() => {
                        return this.serviceOrderDataStore.remove();
                    })
                    .then(result => {
                        console.log("Remove Success", result.count);
                        let promises = new Array<Promise<Kinvey.Entity>>();

                        accounts.forEach((a, x) => {
                            // How many service orders? Make it random
                            let totalOrders = this.randomIntFromInterval(1,5);

                            for (let i = 0; i < totalOrders; i++) {
                                let newOrder = new ServiceOrder();
                
                                newOrder.id = faker.random.uuid();
                                newOrder.accountId = a.id; // Link to account
                                newOrder.contactId = a.contacts.find(c => { return c.isPrimary === true; }).id;
                                newOrder.incidentType = faker.random.arrayElement(["Perform upgrade", "Unknown problem", "Running slow", "Regular maintenance", "Machine broken"]);
                                newOrder.locationType = "OnSite";
                                newOrder.serviceType = faker.random.arrayElement(["Installation","Inspection","Service Call"]);
                                newOrder.severity = faker.random.arrayElement(["Emergency","High","Normal","Low"]);

                                newOrder.isActive = true;
                                newOrder.isComplete = false;
                                newOrder.estimatedDuration = faker.random.arrayElement([30,60,90]);

                                // Make current user the default tech assigned to service orders
                                newOrder.assignedToId = Kinvey.User.getActiveUser()._id;

                                // Make sure we create service orders with dates that make sense in the demo app
                                let d = new Date();
                                if (x < 5 && i === 0) { 
                                    // For first 5 accounts, make first order for TODAY
                                    let arrival = d;
                                    arrival.setHours(8 + (x * 2), 0, 0, 0);
                                    newOrder.estimatedArrival = arrival;
                                } else if (x >= 5 && i === 0) {
                                    // For second 5 accounts, make first order for TOMORROW
                                    let arrival = d;
                                    arrival.setHours(8 + ((x - 5) * 2), 0, 0, 0);
                                    arrival.setDate(arrival.getDate() + 1); // Tomorrow
                                    newOrder.estimatedArrival = arrival;
                                } else {
                                    // For all other orders, assign some date in the past (completed)
                                    let arrival = faker.date.between("1/1/2005", "12/31/2017");
                                    arrival.setHours(8 + ((x < 5) ? x : x - 5) * 2, 0, 0, 0);
                                    newOrder.estimatedArrival = arrival;

                                    // Popular historical data as if techs really arrived/departed
                                    // Adjust for actual arrival with some variance
                                    let actual = new Date(newOrder.estimatedArrival);
                                    actual.setMinutes(actual.getMinutes() + faker.random.arrayElement([0,5,15,20]));
                                    newOrder.actualArrival = actual;
                                    // Set departure time based on duration
                                    let depart = new Date(newOrder.estimatedArrival);
                                    depart.setMinutes(depart.getMinutes() + newOrder.estimatedDuration + faker.random.arrayElement([0,3,5,7,10]));
                                    newOrder.departureTime = depart;

                                    // Assume all old service orders are complete
                                    newOrder.isComplete = true;

                                    // TODO: Generate dummy signature/signature ID

                                    // TODO: Assign other random "techs"/users to the older service orders
                                    let rndmUser = <Kinvey.User>faker.random.arrayElement(users);
                                    newOrder.assignedToId = rndmUser._id;
                                }
                
                                console.log(JSON.stringify(newOrder));
                
                                orders.push(newOrder);
                            }
                        });

                        let entities = new Array<any>();
                        orders.forEach(o => {
                            // Map the Account object to Kinvey column names
                            let e = {
                                _id: o.id,
                                account_id: o.accountId,
                                contact_id: o.contactId,
                                assigned_to_id: o.assignedToId,
                                primary_incident_type: o.incidentType,
                                service_order_type: o.serviceType,
                                service_location_type: o.locationType,
                                severity: o.severity,
                                estimated_arrival: o.estimatedArrival,
                                estimated_duration: o.estimatedDuration,
                                actual_arrival: o.actualArrival,
                                departure_time: o.departureTime,
                                signature_image_id: o.signatureImageId,
                                signature_image_url: o.signatureImageUrl,
                                is_complete: o.isComplete,
                                is_active: o.isActive
                            }
                            entities.push(e);
                        });

                        this.forEachPromise(entities, this.saveEntity, this.serviceOrderDataStore)
                            .then(result => {
                                console.log("Demo ServiceOrders created!", orders.length);
                                resolve(orders);
                            })
                            .catch(err => {
                                console.warn("Error saving ServiceOrders", err);
                                reject(err);
                            });
                    })
                    .catch(err => {
                        console.warn("Oops! Something went wrong clearing the 'serviceorders' collection", err);
                        reject(err);
                    });
            });
        }

        private generateServiceOrderHistory = (orders: Array<ServiceOrder>, users: Array<Kinvey.User>):Promise<Array<ServiceOrderHistory>> => {
            let history = new Array<ServiceOrderHistory>();

            return new Promise((resolve, reject) => {
                // Clear any existing demo data
                // let query = new Kinvey.Query();
                console.log("Attempt to generate service order history entities...");
                this.serviceOrderHistoryDataStore.sync()
                    .then(() => {
                        return this.serviceOrderHistoryDataStore.remove();
                    })
                    .then(result => {
                        console.log("Remove Success", result.count);
                        let promises = new Array<Promise<Kinvey.Entity>>();

                        orders.forEach((o) => {
                            // How many contacts? Make it random
                            let totalHistory = this.randomIntFromInterval(1,5);

                            for (let i = 0; i < totalHistory; i++) {
                                let newHistory = new ServiceOrderHistory();
                
                                newHistory.id = faker.random.uuid();
                                newHistory.notes = faker.lorem.paragraphs(this.randomIntFromInterval(1,6));
                                newHistory.userId = (<Kinvey.User>faker.random.arrayElement(users))._id;
                                newHistory.serviceOrderId = o.id;
                                newHistory.isActive = true;
                
                                console.log(JSON.stringify(newHistory));
                
                                history.push(newHistory);
                            }
                        });

                        let entities = new Array<any>();
                        history.forEach(h => {
                            // Map the Account object to Kinvey column names
                            let e = {
                                _id: h.id,
                                service_order_id: h.serviceOrderId,
                                technician_id: h.userId,
                                notes: h.notes,
                                is_active: h.isActive,
                            }
                            entities.push(e);
                        });

                        this.forEachPromise(entities, this.saveEntity, this.serviceOrderHistoryDataStore)
                            .then(result => {
                                console.log("Demo ServiceOrderHistory created!");
                                resolve(history);
                            })
                            .catch(err => {
                                console.warn("Error saving service order histories", err);
                                reject(err);
                            });
                    })
                    .catch(err => {
                        console.warn("Oops! Something went wrong clearing the 'serviceorderhistory' collection", err);
                        reject(err);
                    });
            });
        }

        private saveEntity = (entity: any, dataStore: Kinvey.CacheStore): Promise<void> => {
            console.log("Saving entity...");
            return new Promise((resolve, reject) => {
                dataStore.save(entity)
                    .then(result => {
                        console.log("Success Saving Entity", result._id);                    
                        resolve();
                    })
                    .catch(err => {
                        console.warn("Error Saving Entity", err);
                        reject(err);
                    });
            });
        }

        private saveUser = (user: Kinvey.User): Promise<void> => {
            return new Promise((resolve, reject) => {
                console.log("Attempt to save user", user.username);
                Kinvey.User.exists(user.username)
                    .then(exists => {
                        if (exists) {
                            console.log("User already exists.");
                            Kinvey.User.logout()
                                .then(() => {
                                    return Kinvey.User.login(user.username, "demo");
                                })
                                .then(user => {
                                    this.usersCache.push(user);
                                    resolve();
                                })
                        } else {
                            console.log("User does NOT exist. Creating...", user.data["first_name"]);
                            Kinvey.User.logout()
                                .then(() => {
                                    return Kinvey.User.signup({
                                        username: user.username,
                                        password: "demo",
                                        email: user.email,
                                        first_name: user.data["first_name"],
                                        last_name: user.data["last_name"],
                                        photoUrl: user.data["photoUrl"]
                                    });
                                })
                                .then(user => {
                                    console.log("User Signup Success");
                                    this.usersCache.push(user);
                                    resolve();
                                })
                                .catch(err => {
                                    console.warn("User Signup Error", err);
                                    reject();
                                });
                        }
                    });
            });
        }

        private forEachPromise = (items, fn, dataStore?) => {
            return items.reduce(function (promise, item) {
                return promise.then(function () {
                    return fn(item, dataStore);
                });
            }, Promise.resolve());
        }

        private randomIntFromInterval = (min,max) => {
            return Math.floor(Math.random()*(max-min+1)+min);
        }

        private coinFlip = ():boolean => {
            return (Math.floor(Math.random() * 2) == 0);
        }

        private initDataStores = () => {
            this.acctDataStore = Kinvey.DataStore.collection("account");
            this.contactDataStore = Kinvey.DataStore.collection("contact");
            this.addrDataStore = Kinvey.DataStore.collection("accountaddress");
            this.territoryDataStore = Kinvey.DataStore.collection("serviceterritory");
            this.serviceOrderDataStore = Kinvey.DataStore.collection("serviceorder");
            this.serviceOrderHistoryDataStore = Kinvey.DataStore.collection("serviceorderhistory");
        }

        private disposeDataStores = (): Promise<void> => {
            // Remove the local data cache so the "real app" behaves normally
            return new Promise(resolve => {
                this.acctDataStore.clear()
                    .then(() => {
                        return this.contactDataStore.clear();
                    })
                    .then(() => {
                        return this.addrDataStore.clear();
                    })
                    .then(() => {
                        return this.territoryDataStore.clear();
                    })
                    .then(() => {
                        return this.serviceOrderDataStore.clear();
                    })
                    .then(() => {
                        return this.serviceOrderHistoryDataStore.clear();
                    })
                    .then(() => {
                        resolve();
                    })
            }); 
        }
}
