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
    * _TODO: Provide instructions or script to init Kinvey schema_
    * Create at least one User `(Identity > Users > +Add User)`
      * _You will use this username/password to log in to the app_
3. Modify `config.ts` in the `app` directory to provide the requested SDK API keys
    * At a minimum, the Google Maps SDK and Kinvey SDK API keys are needed
4. Run the app on iOS or Android
    * `tns run ios` or `tns run android`
    * NOTE: The template is currently optimized for tablets

## Issues
If you run in to trouble getting this template configured, or have suggestions for improving the template, please open an [Issue](https://github.com/toddanglin/ns-fieldsvc-template/issues)
