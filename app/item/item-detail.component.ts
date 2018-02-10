import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { Item } from "./item";
import { ItemService } from "./item.service";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { SignatureModal } from "./collect-signature/signature-modal.component";
import { PaymentModal } from "./collect-payment/payment-modal.component";


@Component({
    selector: "ns-details",
    moduleId: module.id,
    templateUrl: "./item-detail.component.html",
})
export class ItemDetailComponent implements OnInit {
    item: Item;

    constructor(
        private itemService: ItemService,
        private route: ActivatedRoute,
        private modalService: ModalDialogService,
        private vcRef: ViewContainerRef,
    ) { }

    ngOnInit(): void {
        const id = +this.route.snapshot.params["id"];
        this.item = this.itemService.getItem(id);
    }

    onShowSignatureModal = (event) => {
        console.log("Show Signature tapped");
        
        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };

        return this.modalService.showModal(SignatureModal, options);
    };

    onShowPaymentModal = (event) => {
        console.log("Show Payment tapped");
        
        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };

        return this.modalService.showModal(PaymentModal, options);
    };
}
