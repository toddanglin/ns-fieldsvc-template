import { NgModule, NO_ERRORS_SCHEMA, NgModuleFactoryLoader } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { ModalDialogService } from "nativescript-angular/modal-dialog";
import { AppRoutingModule } from "./app.routing";
import { AppComponent } from "./app.component";

import { ItemService } from "./item/item.service";
import { ItemsComponent } from "./item/items.component";
import { ItemDetailComponent } from "./item/item-detail.component";
import { isIOS } from "tns-core-modules/platform/platform";

import { TNSFontIconModule } from 'nativescript-ngx-fonticon';
import { LoginComponent } from "./login/login.component";
import { LoginService } from "./login/login.service";
import { GenerateDataService } from "./shared/generatedata.service";
import { NSModuleFactoryLoader } from "nativescript-angular/router";
import { ModalDetail } from "./item/modal-detail/modal-detail.component";
import { SignatureModal } from "./item/collect-signature/signature-modal.component";
import { PaymentModal } from "./item/collect-payment/payment-modal.component";

// API Key Strings
import { Config } from "./config";


// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from "nativescript-angular/forms";

// Uncomment and add to NgModule imports  if you need to use the HTTP wrapper
// import { NativeScriptHttpModule } from "nativescript-angular/http";
import { AuthGuard } from './auth-guard.service';

declare var GMSServices: any;

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
		TNSFontIconModule.forRoot({
			'fa': './assets/fontawesome.css',
			'ion': './assets/ionicons.css'
		})
    ],
    entryComponents: [
        ModalDetail,
        SignatureModal,
        PaymentModal
    ],
    declarations: [
        AppComponent,
        ItemsComponent,
        ItemDetailComponent,
        LoginComponent,
        ModalDetail,
        SignatureModal,
        PaymentModal,
    ],
    providers: [
        ModalDialogService,
        ItemService,
        LoginService,
        GenerateDataService,
        AuthGuard,
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule { 
    constructor() {
        if (isIOS) {
            console.log("GOOGLE MAPS API KEY", Config.GOOGLE_MAPS_KEY);
            GMSServices.provideAPIKey(Config.GOOGLE_MAPS_KEY);
        }

    }
}
