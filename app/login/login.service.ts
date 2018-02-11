import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";

@Injectable()
export class LoginService {

    public redirectPath: string;
    
    login(username: string, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            Kinvey.User.login(username, password)
                .then(user => {
                    console.log("Login success.", JSON.stringify(user.data));
                    resolve(true);
                })
                .catch(err => {
                    console.warn("Login failure.", err);
                    resolve(false);
                });
        });
    }

    logout(): void {
        console.log("Logout User");

        // Clear cached credentials
        Kinvey.User.logout();

        return;
    }

    isLoggedIn(): boolean {
        // Check for cached user credentials
        let activeUser = Kinvey.User.getActiveUser();

        // If activeUser is NOT null, then login exists
        return (activeUser === null) ? false : true;
    }
}
