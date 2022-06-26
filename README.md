# PEAR_ReactNative Expo

## File Structure
Note: File structure will continuously be updated
```
└── PEAR_ReactNativeExpo
    ├── app
    │   ├── assets     -- will contain the images `.jpg`, `.png`, etc.
    │   │   
    │   ├── components -- reusable code to be used in screens; buttons.
    │   │   
    │   ├── api        -- API Layer [Single Responsibility Principle]
    │   │   
    │   ├── auth        -- Authentication handling layer. e.g. login, logout
    │   │   
    │   ├── hooks      -- Custom Hooks location.Convention:use<Something>.js
    │   │
    │   ├── navigation -- Routing and Navigation folders.
    │   │
    │   ├── utility    -- contains cache layer and misc. 
    │   │
    │   ├── config     -- common constants to be stored here. 
    │   │   └── colors.js -- common color constants.
    │   └── screens    -- pages to be navigated to.
    │       
    ├── App.js         -- React Native Expo entry point
    │       
    ├── docs           -- Includes misc documentations.
    │
    ├── node_modules   -- Imported libraries from package.json
    │
    ├── babel.config.js 
    │
    ├── package.json   -- Project's dependencies, scripts, version 
    │
    └── README.md
```

## Setting up

#### Installation
1. node version >= 12.0
```bash
# to check for node version run the following command.
node -v
```
2. expo-cli
```bash
npm i -g expo-cli
# if you're on mac and you haven't configured npm. Run the following command.
sudo npm i -g expo-cli
```
3. Install `expo client` on your phone from AppStore(ios) or PlayStore(android). This is for us to see how the app looks like on our physical devices.\
[Link to playstore](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en_US&gl=US)\
[Link to appstore](https://apps.apple.com/us/app/expo-go/id982107779)\
4. Visual Studio Code edittor (optional but recommended), because you get access to all the shortcuts :).
[Link to vscode](https://code.visualstudio.com/)\
   - Extensions to install in vscode:
     - React native tools (built by microsoft)
     - react-native/react/redux snippets for es6/es7 
     - prettier - code formatter by Esben Petersen (for linting)
     - material icon theme by Phillipp Kief (better folder icons)
5. Install react-native debugger from this [Link](https://github.com/jhen0409/react-native-debugger).
6. Install android studio form this [Link](https://developer.android.com/studio). (ignore this if you already have it)
7. Install xcode for ios [Link](https://apps.apple.com/sg/app/xcode/id497799835?mt=12)

#### How to run?
Note: If you're on windows, you will probably only be able to run the `android` simulator. However, if you're on mac, you should be able to run both `android` and `ios` simulators.\
1. cd to `./PEAR_REACTNATIVEEXPO` root folder.
2. Remove `node_modules` folder and `package-lock.json` file. (Note: NOT `package.json`)
3. run `npm install`.
4. run `npm start`, and expo will begin running.
    - To run `android` simulator. Hit the `a` key. 
    - To run `ios` simulator. Hit the `i` key.
    - To run `web`. Hit the `w` key.


Some issues faced during installation guide:
- Android panic borken avd system (android simulator issue). [Link](https://stackoverflow.com/questions/39645178/panic-broken-avd-system-path-check-your-android-sdk-root-value)


#### How to run on physical device?
1. Simply scan the `QR code` (displayed after running `npm start`) using the `expo client`.

#### Do we have an onboarding document?
[Onboarding Documentation Link](https://docs.google.com/document/d/1HbNEdbgKrMtBZ9JSGzaDNijcwKnfAUJzZj-TA8YL2IY/edit)

## PR Conventions / How To Contribute?
Please refer to: [Our Contribution page](https://github.com/ntu-pear/PEAR_ReactNativeExpo/blob/main/docs/contribution.md)

## External Resources Used
1. https://reactnativeelements.com/ similar to react bootstrap
2. https://reactnavigation.org/  [For navigation/ Routing]
3. https://airbnb.design/lottie/ [Airbnb Animation Loader Design]
4. https://github.com/infinitered/apisauce [Axios + standardized errors + request/response transforms.]
5. https://docs.expo.dev/versions/latest/sdk/async-storage/ [Asyncstorage - acts like cache]
6. https://github.com/moment/moment [A JavaScript date library for parsing, validating, manipulating, and formatting dates.]
7. https://github.com/react-native-netinfo/react-native-netinfo [Netinfo used to check for internet connectivity]
8. https://github.com/auth0/jwt-decode [For decoding jwt tokens - Auth]
9. https://reactjs.org/docs/context.html [For exposing data to all components]
10. https://docs.expo.dev/versions/latest/sdk/securestore/ [Manage auth token storage]

## Setup Resources
1. https://github.com/jhen0409/react-native-debugger [React-Native Debugger]


## Proper Conventions
- You are very much encouraged to include comment(s) on every function that you've created. This will help your friends better understand your code.
  - Better still, try to write `self_documenting_code`. It'll definitely help your friends. Refer to this [article](https://www.linkedin.com/posts/eczachly_softwareengineering-activity-6944815639593177088-rK-O/?utm_source=linkedin_share&utm_medium=member_desktop_web).
- If your function is too long, split them up. Remember [Single Responsibility](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- You are also very much encouraged to create `custom_hooks` to abstract certain logic. It helps!
- Lastly, just enjoy the process of building this app with your friends!
