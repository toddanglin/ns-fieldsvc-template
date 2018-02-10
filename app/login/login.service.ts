import { Injectable } from "@angular/core";

@Injectable()
export class LoginService {
    
    login(username: string, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            console.log("TODO: Handle login logic");

            // Simulate login failures
            if (password === "fail") {
                console.warn("Login failure.");
                resolve(false);
            } else {
                console.log("Login success.");
                resolve(true);
            }
        });
    }

    logout(): void {
        console.log("TODO: Handle logout logic");
        return;
    }
}
