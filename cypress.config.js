const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'trv4zb',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      const getCompareSnapshotsPlugin = require("cypress-image-diff-js/dist/plugin");
      getCompareSnapshotsPlugin(on, config);
    },
  },
  fixturesFolder: 'cypress/fixtures',
});
