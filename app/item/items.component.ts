import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ViewContainerRef } from "@angular/core";

import { Item } from "./item";
import { ItemService } from "./item.service";

import { topmost } from "ui/frame";
import { DeviceType } from "ui/enums";
import { isIOS, device } from "platform";
import { confirm } from "ui/dialogs";

import { MapView, Marker, Position } from "nativescript-google-maps-sdk";

import { TNSFontIconService } from 'nativescript-ngx-fonticon';

import {registerElement} from "nativescript-angular/element-registry";
import { EventData } from "tns-core-modules/data/observable/observable";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { ModalDetail } from "./modal-detail/modal-detail.component";
import { dial, sms } from "nativescript-phone";
import * as email from "nativescript-email";
import { Feedback } from "nativescript-feedback";

// Important - must register MapView plugin in order to use in Angular templates
registerElement("MapView", () => require("nativescript-google-maps-sdk").MapView);

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./items.component.html",
    providers: [
        ModalDialogService
    ],
    styles: [`
        .highlight: {
            background-color: #555;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsComponent implements OnInit {
    items: Item[];
    selectedItem: Item;
    isTablet: boolean = device.deviceType === DeviceType.Tablet;
    mapViewRef: MapView;
    @ViewChild("MapView") mapView: ElementRef;
    feedback: Feedback;

    // This pattern makes use of Angular’s dependency injection implementation to inject an instance of the ItemService service into this class. 
    // Angular knows about this service because it is included in your app’s main NgModule, defined in app.module.ts.
    constructor(private itemService: ItemService, 
                private routerExtensions: RouterExtensions, 
                private modalService: ModalDialogService,
                private vcRef: ViewContainerRef,
                private fonticon: TNSFontIconService) { }

    ngOnInit(): void {
        if (isIOS) {
            let navigationBar = topmost().ios.controller.navigationBar;
            navigationBar.barStyle = UIBarStyle.Black;
        }
        this.itemService.getItems()
            .then(items => {
                this.items = items;
                this.selectedItem = this.items[0];
            });
        
        this.feedback = new Feedback();
    }

    //Map events
    onMapReady = (event) => {
        console.log("Map Ready");
        let mapView = <MapView>event.object;
        this.mapViewRef = mapView;
        
        // Add pins for items
        this.items.forEach(i => {
            let marker = new Marker();
            marker.position = Position.positionFromLatLng(i.lat, i.lng);
            marker.title = i.company;
            marker.snippet = i.title;
            marker.userData = i;
            mapView.addMarker(marker);
        });

        // Center map on first item coords
        mapView.latitude = this.items[0].lat;
        mapView.longitude = this.items[0].lng;
    };

    changeMapLoc = (event) => {
        console.log("ROW TAPPED");

        let item = event.view.bindingContext;

        this.selectedItem = item;

        this.mapViewRef.latitude = item.lat;
        this.mapViewRef.longitude = item.lng;
    };

    onLogout = (event) => {
        console.log("User initiated Log Out");

        confirm({
            title: "Logout Confirmation",
            message: "Are you sure you want to log out?",
            okButtonText: "Log out",
            cancelButtonText: "Cancel"
            })
            .then(answer => {
                if (answer) {
                    console.log("User confirmed logout");
                    this.routerExtensions.navigate(["/login"], { clearHistory: true, transition: { name: "slideTop", curve: "easeInOut" } });
                }
            });
    };

    onShowInfo = (event) => {
        console.log("Show Info tapped");
        
        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: this.selectedItem,
            fullscreen: false,
        };

        return this.modalService.showModal(ModalDetail, options);
    };

    dialPhone = () => {
        console.log("Dial phone tapped");

        let num = this.selectedItem.phone;
        let dialResult = dial(num, true);

        if (dialResult) {
            console.log("Call succeeded");
        } else {
            console.warn("Call failed");
        }
    }

    sendSMS = () => {
        console.log("Send SMS tapped");

        sms([this.selectedItem.phone], `Hello, ${this.selectedItem.contact}.`)
            .then(result => {
                console.log("SMS Done", JSON.stringify(result));

                if (result.success) {
                    this.feedback.success({
                        title: "Message Sent",
                        message: "Text message succesfully sent to customer"
                    })
                } else if (result.failed) {
                    this.feedback.error({
                        title: "SMS Error",
                        message: "Sorry. Something went wrong trying to send the SMS message. Please try again."
                    });
                }
            })
            .catch(err => {
                console.warn("SMS Error", err);

                this.feedback.error({
                    title: "SMS Error",
                    message: "Sorry. Something went wrong trying to send the SMS message. Please try again."
                });
            })
    }

    sendEmail = () => {
        console.log("Send email tapped");

        email.available()
            .then(available => {
                console.log("Email is available?", available);

                if(available) {
                    email.compose({
                        to: [this.selectedItem.email],
                        subject: "Message from your service tech",
                        body: `Hello ${this.selectedItem.contact}`
                    }).then(result => {
                        if (result) {
                            console.log("Email sent success");
                            this.feedback.success({
                                title: "Email Sent",
                                message: `Your email was successfully sent to ${ this.selectedItem.email }`
                            });
                        } else {
                            console.warn("Email send error");
                            this.feedback.warning({
                                title: "Email Problem",
                                message: "Sorry. Something went wrong trying to send your message. Check your email app to confirm the email did not send, and try again."
                            });
                        }
                    }).catch(err => {
                        console.warn("Error Sending Email", err);
                        this.feedback.error({
                            title: "Email Error",
                            message: "Doh. Something went wrong trying to send your email. Please try again."
                        });
                    });
                } else {
                    this.feedback.error({
                        title: "Email Error",
                        message: "Hmm. Email does not seem to be setup on this device. Please check your settings and try again."
                    });
                }
            })
            .catch(err => {
                console.warn("Error trying to send email", err);
                this.feedback.error({
                    title: "Email Error",
                    message: "Hmm. Email does not seem to be setup on this device. Please check your settings and try again."
                });
            });
    }
}