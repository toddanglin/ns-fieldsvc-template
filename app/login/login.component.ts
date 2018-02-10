import { RouterExtensions } from 'nativescript-angular/router';
import { TextField } from 'tns-core-modules/ui/text-field';
import { Component, OnInit } from '@angular/core';
import { isIOS } from 'tns-core-modules/platform/platform';
import { topmost } from 'tns-core-modules/ui/frame/frame';
import { LoginService } from './login.service';
import { Feedback, FeedbackPosition, FeedbackType } from "nativescript-feedback";
import { Page } from 'ui/page';

//import { RouterExtensions } from 'nativescript-angular';
//import { TextField } from 'ui/text-field';
//import { EventData } from 'data/observable';
//import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'login',
	templateUrl: './login/login.component.html'
})

export class LoginComponent implements OnInit {
	feedback: Feedback;

	constructor(private loginSvc: LoginService, private routerExtensions: RouterExtensions, private page: Page) { 
		this.page.actionBarHidden = true;
        this.page.backgroundSpanUnderStatusBar = true;
	}

	ngOnInit() {
		if (isIOS) {
            let navigationBar = topmost().ios.controller.navigationBar;
			navigationBar.barStyle = UIBarStyle.Black;
		}
		
		this.feedback = new Feedback();
	}

	focusPass = (event) => {
		let txtPass = <TextField>topmost().getViewById("txtPassword");
		txtPass.focus();
	};

	onLogin = () => {
		console.log("Login Event");
		let txtUser = <TextField>topmost().getViewById("txtUsername");
		let txtPass = <TextField>topmost().getViewById("txtPassword");

		// Hide soft keyboard
		txtUser.dismissSoftInput();
		txtPass.dismissSoftInput();

		if (txtUser.text.trim() === "" || txtPass.text.trim() === "") {
			console.log("Missing required login values. Aborting login attempt.");

			this.feedback.warning({
				title: "Required Inputs",
				message: "Oops! You must provide both your email and password before logging-in."
			});

			return;
		}

		console.log("Attempt Login");
		let username = txtUser.text.trim();
		let pass = txtPass.text.trim();

		this.loginSvc.login(username, pass)
			.then(success => {
				if (success) {
					// Login successful, redirect to main page
					console.log("Login success! Redirect...");

					this.routerExtensions.navigate(["/items"], { clearHistory: true, transition: { name: "slideBottom", curve: "easeInOut" } });
				} else {
					// Login failed, show error to user
					console.warn("Login failed");

					this.feedback.error({
						title: "Login Failed",
						message: "Uh-oh. The username or password provided was incorrect. Please try again."
					});

					return;
				}
			});
	};
}