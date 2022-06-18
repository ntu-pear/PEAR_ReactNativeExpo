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
    ├── node_modules   -- Imported libraries from package.json
    │
    ├── babel.config.js 
    │
    ├── package.json   -- Project's dependencies, scripts, version 
    │
    └── README.md
```

## Setting up
#### TODO: Set up documentation 

## PR Conventions
#### TODO: Set up pr conventions

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
#### TODO