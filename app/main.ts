// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic } from "nativescript-angular/platform";

import { AppModule } from "./app.module";

import * as app from 'application';
import { isIOS } from "tns-core-modules/platform/platform";

const config = require("./config.json");

declare const STPPaymentConfiguration;

/* ***********************************************************
* The {N} Kinvey plugin needs some initialization steps before it is ready
* for use. Check out the initialization script at /shared/kinvey.common.ts
* along with more information about it.
*************************************************************/
import "./shared/kinvey.common";

platformNativeScriptDynamic().bootstrapModule(AppModule);

app.on(app.launchEvent, (args) => {
    if (isIOS) {
        console.log("STRIPE API KEY", config.STRIPE_TEST_KEY);
        STPPaymentConfiguration.sharedConfiguration().publishableKey = config.STRIPE_TEST_KEY;
    }
});
