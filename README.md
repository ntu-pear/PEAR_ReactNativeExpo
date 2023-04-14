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
    │       └── web    -- web related pages.
    |
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

## Testing

### Jest

Jest is used as a testing library to test the logic and the appearance of the components.
Please refer to the jest documentation in the links above and the existing tests for examples on how to write tests for your components.

### Cypress (WIP, @weilun)

### Adding a test (Jest)

0. If a `__test__` directory does not exist in the root directory of your component,
   create a `__test__` directory in the root directory of your component. (Tests do not necessarily need to be for a component, it can be for any file that you wish to test, e.g. files that contain utiliy logic such as
   fetching/storing/modifying data).

Creating a `__test__` directory in the root of the component to be tested

```
├── components
      ├── __test__
      |     └── YourComponent.test.js
      └── YourComponent.js

```

1. To write a new test for your component, add a new file (<YourTestName.test.js>) to the `__test__` directory in the root directory of the component to be tested. (refer to example above).

2. To run your tests, run `npm test`.

3. For test re-running when relevant files have been changed (optional feature, like hot-reload), run `npm test-watch`.

### Types of Test (WIP)

1. Unit Tests\
   Tests that verify the behaviour of individual functions or modules in isolation. Unit tests help to ensure that each piece of code in the application is functioning as intended. Currently there are no unit tests in the repository, some areas where unit tests can be added are the utility functions, such as `cache.js`, various hooks in the `\hooks` directory, `authStorage.js`.

   It's not necessary to test the APIs that call the backend for data (in the `\api` folder), since they are only making a http request to the backend for data, without processing it.

   In short, unit tests can be written for individual functions in the frontend that provide (usually shared) functionality.

2. Integration Tests
   Tests that verify how different parts of the application work together. Most of the tests in this repository contain integration tests, whereby the integration between components and APIs are tested (e.g. component renders correctly when an action is performed that calls an API -> network request, utility functions etc or an action performed in one component changes data to be displayed in another component).
   e.g. `WelcomeScreen.test.js` test the expected behaviour of WelcomeScreen when a user enters a wrong username and password, and the forget password functionality.

3. Snapshot Tests\
   As the name suggests, these are tests that capture the output of a component and compare it to a previously saved version of the same component. Snapshot tests help you catch unexpected changes to your UI or layout. For snapshot tests, add a .snapshot suffix to it, e.g. `NotificationsScreen.snapshot.test.js`. If the snapshot test is being run for the first time, the test will pass and a snapshot of the component will be generated `<Name of snapshot test>.snap`. This file will be used to compare against subsequent snapshots of the component. If a snapshot fails due to an intentional change in the appearance of the UI, run `jest --updateSnapshot` (add it as a script to package.json if not available) to [update the snapshots](https://jestjs.io/docs/snapshot-testing#updating-snapshots).

4. End-to-end Tests (WIP, @weilun)\
   End-to-end tests simulate a user interacting with the application from start to finish and verifying that everything works correctly from the user's perspective. End-to-end testing can help catch bugs and usability issues that might only become apparent when the application is used in real life.

### Best practices

1. Mocking\
   If what you're testing involves a call to the backend (unless it's an end-to-end test), mock the API used to call the backend to return mock/fake data. This is because network latencies involved in data fetching can often result in test flakiness (i.e. the test can fail sometimes and succeed sometimes) due to reasons such as the test timing out before the component can re-render.

2. Do not test against implementation details\
   When writing integration tests/end-to-end tests, in order to verify behaviour, it might be tempting to test against implementation details, for e.g. check whether a certain function is called a certain number of times, or checking the state of a component matches what is expected.

   This is not good practice as it can result in false negatives when code is refactored (but behaviour remains the same), which defeats the point of having failing tests. On the flipside, code may not fail when application code breaks (false positive). This means that tests are failing for the wrong reasons, which means that the tests are not very useful.

   For a more in-depth explanation on why you should (generally) not test against implementation details, read [here](https://kentcdodds.com/blog/testing-implementation-details), and [here](https://codingitwrong.com/2018/12/03/why-you-should-sometimes-test-implementation-details.html) (when to maybe test implementation details).

## Github Actions

Github action workflows can be found in the `.github/workflows` directory. Github actions are used for running tests (`test-e2e.yml`, `test-unit.yml`), previewing changes and deploying code. Refer to the [official site](https://docs.github.com/en/actions/guides) for writing/editing Github actions.

Here are some things to note when creating/editing your Github Actions workflows.

**Limits**

The [limit](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions) each month for Github Actions on a free account is 2000 minutes. Please
keep this in mind when introducing more build workflows. As far as possible, try to cache data (e.g. caching node modules) or run workflows under restricted conditions (e.g. (just as an illustration) run end-to-end only when merge to main)

**Versioning**

Make sure that the tests that are being run in the CI are in a same or compatible environment as the environment that is used for development. Outdated npm and/or node versions (that are not updated during the CI pipeline) have been known to cause failed builds in the past, even though the exact same tests pass when run locally.

## Troubleshooting

Add common errors encountered during CI/CD (and fixed) to this section

## Do we have an onboarding document?

[Onboarding Documentation Link](https://docs.google.com/document/d/1HbNEdbgKrMtBZ9JSGzaDNijcwKnfAUJzZj-TA8YL2IY/edit)

## PR Conventions / How To Contribute?

Please refer to: [Our Contribution page](https://github.com/ntu-pear/PEAR_ReactNativeExpo/blob/main/docs/contribution.md)

## External Resources Used

1. https://reactnativeelements.com/ similar to react bootstrap
2. https://reactnavigation.org/ [For navigation/ Routing]
3. https://airbnb.design/lottie/ [Airbnb Animation Loader Design]
4. https://github.com/infinitered/apisauce [Axios + standardized errors + request/response transforms.]
5. https://docs.expo.dev/versions/latest/sdk/async-storage/ [Asyncstorage - acts like cache]
6. https://github.com/moment/moment [A JavaScript date library for parsing, validating, manipulating, and formatting dates.]
7. https://github.com/react-native-netinfo/react-native-netinfo [Netinfo used to check for internet connectivity]
8. https://github.com/auth0/jwt-decode [For decoding jwt tokens - Auth]
9. https://reactjs.org/docs/context.html [For exposing data to all components]
10. https://docs.expo.dev/versions/latest/sdk/securestore/ [Manage auth token storage]
11. https://jestjs.io/docs/snapshot-testing/ [Test appearance of components]
12. https://jestjs.io/docs/tutorial-react-native [Testing in react native]

## Setup Resources

1. https://github.com/jhen0409/react-native-debugger [React-Native Debugger]

## Proper Conventions

- You are very much encouraged to include comment(s) on every function that you've created. This will help your friends better understand your code.
  - Better still, try to write `self_documenting_code`. It'll definitely help your friends. Refer to this [article](https://www.linkedin.com/posts/eczachly_softwareengineering-activity-6944815639593177088-rK-O/?utm_source=linkedin_share&utm_medium=member_desktop_web).
- If your function is too long, split them up. Remember [Single Responsibility](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- You are also very much encouraged to create `custom_hooks` to abstract certain logic. It helps!
- Lastly, just enjoy the process of building this app with your friends!

## Overall App Architecture

#### TODO
