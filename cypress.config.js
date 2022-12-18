const { defineConfig } = require("cypress");
const { initPlugin } = require ("@frsource/cypress-plugin-visual-regression-diff/plugins");
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      initPlugin(on, config)
    },
    scrollBehavior: false
  },
});
