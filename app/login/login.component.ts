import { RouterExtensions } from 'nativescript-angular/router';
import { TextField } from 'tns-core-modules/ui/text-field';
import { Component, OnInit } from '@angular/core';
import { isIOS } from 'tns-core-modules/platform/platform';
import { topmost } from 'tns-core-modules/ui/frame/frame';
import { LoginService } from './login.service';
import { GenerateDataService } from '../shared/generatedata.service';
import { Feedback, FeedbackPosition, FeedbackType } from "nativescript-feedback";
import { Page } from 'ui/page';
import { confirm } from "ui/dialogs";
import { Config } from "../config";
import { FingerprintAuth, BiometricIDAvailableResult } from "nativescript-fingerprint-auth";
import { SecureStorage } from "nativescript-secure-storage";
import * as appSettings from "tns-core-modules/application-settings";

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
	strUsername: string;
	strPassword: string;
	isGeneratingData: boolean;
	isLoggingIn: boolean;
	isKinveyAPIConfigured: boolean;
	private fingerprintAuth: FingerprintAuth;
	private secureStorage: SecureStorage;
	private isBioAuthAvailable: boolean;
	private isFingerprintAvailable: boolean;
	private isFaceAvailable: boolean;

	constructor(private loginSvc: LoginService, private demoDataSvc: GenerateDataService, private routerExtensions: RouterExtensions, private page: Page) { 
		this.page.actionBarHidden = true;
		this.page.backgroundSpanUnderStatusBar = true;
		this.fingerprintAuth = new FingerprintAuth();
		this.secureStorage = new SecureStorage();
	}

	ngOnInit() {
		if (isIOS) {
            let navigationBar = topmost().ios.controller.navigationBar;
			navigationBar.barStyle = UIBarStyle.Black;
		}
		
		this.feedback = new Feedback();
		this.isGeneratingData = false;
		this.isLoggingIn = false;
		this.strUsername = "";
		this.strPassword = "";
		this.isBioAuthAvailable = false;

		this.checkForBioAuth();

		this.checkForKinveyAPIKeys();
	}

	checkForBioAuth = (): void => {
		this.fingerprintAuth.available().then((result: BiometricIDAvailableResult) => {
			console.log(`Biometric ID available? ${result.any}`);
			console.log(`Touch? ${result.touch}`);
			console.log(`Face? ${result.face}`);

			this.isBioAuthAvailable = result.any;
			this.isFingerprintAvailable = result.touch ? true : false;
			this.isFaceAvailable = result.face ? true : false;
		  });
	}

	checkForKinveyAPIKeys = (): void => {
		if (Config.KINVEY_APP_KEY === "YOUR_API_KEY" || Config.KINVEY_APP_SECRET === "YOUR_API_KEY") {
			this.isKinveyAPIConfigured = false;
			this.feedback.warning({
				title: "Missing API Keys",
				message: "To use this template, you must provide Kinvey API keys. Please update the app configuration.",
				duration: 10000
			});
		} else {
			this.isKinveyAPIConfigured = true;
		}
	}

	focusPass = (event) => {
		let txtPass = <TextField>topmost().getViewById("txtPassword");
		txtPass.focus();
	};

	onBioLogin = () => {
		this.isLoggingIn = true;
		this.fingerprintAuth.verifyFingerprint(
			{
			  //title: 'Android title', // optional title (used only on Android)
			  message: 'Scan your finger to login', // optional (used on both platforms) - for FaceID on iOS see the notes about NSFaceIDUsageDescription
			  authenticationValidityDuration: 10, // optional (used on Android, default 5)
			  useCustomAndroidUI: false // set to true to use a different authentication screen (see below)
			})
			.then(() => {
				console.log("Biometric ID OK");

				// Get cached username/password
				this.strUsername = this.secureStorage.getSync({ key: "loginUsername" });
				this.strPassword = this.secureStorage.getSync({ key: "loginPassword" });

				console.log("Attempt login with cached bio credentials...");
				this.onLogin();
			})
			.catch(err => {
				console.warn(`Biometric ID NOT OK: ${JSON.stringify(err)}`)

				this.isLoggingIn = false;

				this.feedback.error({
					title: "Authentication Error",
					message: "Failed to valiate using your biometrics. Please try again or log in with your username and password."
				});
			});
	}

	onLogin = () => {
		// Do not proceed if Kinvey API keys are missing
		if (!this.isKinveyAPIConfigured) {
			this.checkForKinveyAPIKeys();

			this.isLoggingIn = false;

			return;
		}

		this.isLoggingIn = true;
		console.log("Login Event");
		let txtUser = <TextField>topmost().getViewById("txtUsername");
		let txtPass = <TextField>topmost().getViewById("txtPassword");

		// Hide soft keyboard
		txtUser.dismissSoftInput();
		txtPass.dismissSoftInput();

		if (this.strUsername.trim() === "" || this.strPassword.trim() === "") {
			console.log("Missing required login values. Aborting login attempt.", `U: ${this.strUsername}`, `P: ${this.strPassword}`);

			this.feedback.warning({
				title: "Required Inputs",
				message: "Oops! You must provide both your email and password before logging-in."
			});

			this.isLoggingIn = false;

			return;
		}

		console.log("Attempt Login");
		let username = this.strUsername.trim();
		let pass = this.strPassword.trim();

		this.loginSvc.login(username, pass)
			.then(success => {
				if (success) {
					// Login successful, redirect to main page
					console.log("Login success! Redirect...");

					let bioAuthPrefSet = appSettings.getBoolean("prefSetAllowBioAuth", false);
					if (this.isBioAuthAvailable && !bioAuthPrefSet) {
						// Confirm if auth user wants to use bio auth in the future
						let title = "Use Fingerprint";
						if (isIOS) {
							title = "Use TouchID";
							if (this.isFaceAvailable) {
								title = "Use FaceID";
							}
						}
						confirm({
							title: title,
							message: "Do you want to enable biometric authentication for future logins?\n\nYour credentials will be securely saved for future logins if you choose this option.",
							okButtonText: "Allow",
							cancelButtonText: "Don't Allow"
						})
						.then(response => {
							// User wants to allow biometric login in the future
							appSettings.setBoolean("allowBioAuth", response);
							appSettings.setBoolean("prefSetAllowBioAuth", true);
						
							if (response) {
								// Securely cache user credentials for future bio logins
								this.secureStorage.setSync({ key: "loginUsername", value: username });
								this.secureStorage.setSync({ key: "loginPassword", value: pass });
							}

							this.navigateToPage();
						})
					} else {
						this.navigateToPage();
					}
				} else {
					// Login failed, show error to user
					console.warn("Login failed");

					this.isLoggingIn = false;

					this.feedback.error({
						title: "Login Failed",
						message: "Uh-oh. The username or password provided was incorrect. Please try again."
					});

					return;
				}
			});
	};

	private navigateToPage = (): void => {
		this.isLoggingIn = false;

		// Redirect to default view OR redirectPath (if set)
		let path = (this.loginSvc.redirectPath === undefined) ? "/items" : this.loginSvc.redirectPath;
		this.loginSvc.redirectPath = undefined;
		this.routerExtensions.navigate([path], { clearHistory: true, transition: { name: "slideBottom", curve: "easeInOut" } });
	}

	onGenerateData = (args) => {
		// Do not proceed if Kinvey API keys are not configured
		if (!this.isKinveyAPIConfigured) {
			this.checkForKinveyAPIKeys();
			return;
		}

		confirm({
            title: "Generate Demo Data",
            message: "This action will ERASE and regenerate the data and users for this template in your Kinvey backend. Any changes that have been made to the backend data will be lost. Do you want to continue?",
            okButtonText: "Continue",
            cancelButtonText: "Cancel"
            })
            .then(answer => {
                if (answer) {
					console.log("User confirmed generate demo data");
					this.isGeneratingData = true;
                    this.demoDataSvc.generateDemoData()
                        .then(() => {
							this.isGeneratingData = false;
							this.feedback.success({
								title: "Demo Data Generated",
								message: "All done. Demo data and users successfully generated in your Kinvey account."
							});

							// Pre-populate login field with demo user
							this.strUsername = "techster@quantum.com";
							this.strPassword = "demo";
                        })
                        .catch(err => {
                            this.feedback.error({
                                title: "Generate Demo Data Error",
                                message: "Oops! Something went wrong trying to generate the demo data. Please try again or check your Kinvey console."
                            });
                        });
                }
            });
	}
}