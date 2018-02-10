import { SegmentedBarItem, SelectedIndexChangedEventData, SegmentedBar } from 'tns-core-modules/ui/segmented-bar';
import { Item } from '../item';
import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "tns-core-modules/ui/page/page";

@Component({
    moduleId: module.id,
    templateUrl: "./modal-detail.component.html",
})
export class ModalDetail implements OnInit {
    public item: Item;
    public barItems: Array<SegmentedBarItem>;
    public selectedIndexId: string;
    
    constructor(private params: ModalDialogParams, private page: Page) {
        this.item = params.context;

        this.page.on("unloaded", () => {
            // using the unloaded event to close the modal when there is user interaction
            // e.g. user taps outside the modal page
            this.params.closeCallback();
        });

        this.barItems = new Array<SegmentedBarItem>();
        let notes = new SegmentedBarItem();
        notes.title = "Notes";
        notes.id = "notes";

        let history = new SegmentedBarItem();
        history.title = "History";
        history.id = "history";

        let resources = new SegmentedBarItem();
        resources.title = "Resources";
        resources.id = "resources";
 
        this.barItems.push(notes, history, resources);
    }

    ngOnInit() {

    }

    close = () => {
        this.params.closeCallback();
    }

    selectedIndexChange = (args) => {
        let bar = <SegmentedBar>args.object;
        let item = <SegmentedBarItem>bar.items[args.value];
        
        this.selectedIndexId = item.id;

        console.log("SelectedIndexId", item.id);
    }
}