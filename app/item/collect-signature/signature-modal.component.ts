import {StackLayout} from 'tns-core-modules/ui/layouts/stack-layout';
import {GridLayout} from 'tns-core-modules/ui/layouts/grid-layout';

import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "tns-core-modules/ui/page/page";

import {registerElement} from "nativescript-angular/element-registry";
import { topmost } from "tns-core-modules/ui/frame/frame";

registerElement("DrawingPad", () => require("nativescript-drawingpad").DrawingPad);

@Component({
    moduleId: module.id,
    templateUrl: "./signature-modal.component.html",
})
export class SignatureModal implements OnInit {
    @ViewChild("DrawingPad") DrawingPad: ElementRef;
    
    constructor(private params: ModalDialogParams, private page: Page) {


        this.page.on("unloaded", () => {
            // using the unloaded event to close the modal when there is user interaction
            // e.g. user taps outside the modal page
            this.params.closeCallback();
        });

    }

    ngOnInit() {

    };

    close = () => {
        this.params.closeCallback();
    };

    saveSignature = (args) => {
        console.log("Save Signature tapped");
        let pad = this.DrawingPad.nativeElement;

        pad.getDrawing()
            .then(data => {
                // TODO: Do something with the signature data
                console.log("Signature Data Captured", data);

                // TODO: Show some kind of "save success" indicator before closing the modal
                setTimeout(() => { this.close(); }, 500);
            })
            .catch(err => {
                console.warn("Something went wrong getting signature", err);
            })
    };

    clearSignature = (args) => {
        console.log("Clear Signature tapped");
        let pad = this.DrawingPad.nativeElement;
        pad.clearDrawing();

        // BUG: clearDrawing erases the signature line, too. Need to restore.
        let grid = <GridLayout>this.page.getViewById("gridSig");
        let hr = new StackLayout();
        hr.cssClasses.add("hr-dark");
        hr.setInlineStyle("margin-top:150;");
        grid.addChild(hr);
    };
}