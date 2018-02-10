
import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "tns-core-modules/ui/page/page";

import {registerElement} from "nativescript-angular/element-registry";
import { topmost } from "tns-core-modules/ui/frame/frame";

import { Stripe } from 'nativescript-stripe';
import { Feedback } from "nativescript-feedback";

registerElement("CreditCardView", () => require("nativescript-stripe").CreditCardView);

@Component({
    moduleId: module.id,
    templateUrl: "./payment-modal.component.html",
})
export class PaymentModal implements OnInit {
    @ViewChild("CreditCardView") CreditCardView: ElementRef;
    private feedback: Feedback;
    private stripe: Stripe;

    constructor(private params: ModalDialogParams, private page: Page) {
        this.page.on("unloaded", () => {
            // using the unloaded event to close the modal when there is user interaction
            // e.g. user taps outside the modal page
            this.params.closeCallback();
        });

        this.stripe = new Stripe("pk_test_E1BaND05At4JRKR6xGCG9Wa0");
    }

    ngOnInit() {
        this.feedback = new Feedback();
    };

    close = () => {
        this.params.closeCallback();
    };

    onSubmitPayment = (args) => {
        // TODO: Process Stripe payment
        console.log("Submit Payment tapped");

        setTimeout(() => {
            this.feedback.success({
                title: "Payment Processed",
                message: "Card ending in 0000 has been successfully charged $00.00."
            })
            .then(() => {
                // After payment complete, close window
                setTimeout(() => { this.close(); }, 1000);
            })            
        }, 500);
    }
}