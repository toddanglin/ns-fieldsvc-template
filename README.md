# {N} Field Service Template
This app template provides the code necessary to create apps for "field service" type use cases. This could be technicians in the field processing work orders, inspectors visiting different sites or even sales people calling on clients. The template is adaptable to the specific use cases that matter for your industry and company.

## What does the template include?
- Login screen
- Tablet "split view" for browsing master/detail
- Support for iOS and Android
- Interactive Maps (powered by Google)
- Signature collection
- Payment collection (powered by Stripe)
- Integration with Kinvey BaaS (for auth and data connectivity)

## How do I use this template?
1. Clone this repo
2. Create a new Kinvey project ([console.kinvey.com](https://console.kinvey.com))
    * Name the project whatever you want (EX: "Field Service App")
3. Modify `config.ts` in the `app` directory to provide the requested SDK API keys
    * At a minimum, the Kinvey SDK and Google Maps SDK API keys are needed
    * Kinvey `APP_KEY` and `APP_SECRET` keys can be found in your [project dashboard](https://devcenter.kinvey.com/rest/guides/getting-started#AddanAppBackend)
    * Google Maps API can be obtained from the [Google Console](https://developers.google.com/maps/documentation/javascript/get-api-key)
4. Run the app on iOS or Android
    * `tns run ios` or `tns run android`
    * NOTE: The template is currently optimized for tablets
5. The first time you run the app, tap the "Generate Demo Data" button on the login screen
    * This will auto-generate the necessary Kinvey collections, users, and demo data on the server
    * TIP: Run this again any time you want to "reset" the demo data
6. Log in to the app with the auto-generated user
    * When the auto-generate step is done, it will pre-populate a username/password you can use to log in to the app
    * Default username is `techster@quantum.com` and password for all demo users is `demo`

## Issues
If you run in to trouble getting this template configured, or have suggestions for improving the template, please open an [Issue](https://github.com/toddanglin/ns-fieldsvc-template/issues)
