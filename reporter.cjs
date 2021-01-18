// my-reporter.js

'use strict';

const Mocha = require('mocha');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;
const Axios = require(`axios`);
const reportResult = require('./reporting/api.cjs');
let version, config;
try
{
  version = require('../../package.json').version;
  config = require('../../gadwick-config.json');
}
catch (error)
{
  console.error(`Could not find required configuration files - make sure you have run "gadwick configure" and "gadwick update" before using this reporter.`)
}

// TODO: Start a new session on gadwick to associate results with
class MochaReporter {
  constructor(runner) {
    if (!version || !config)
    {
      console.error(`Could not find required configuration files - make sure you have run "gadwick configure" and "gadwick update" before using this reporter.`);
      return;
    }
    this._indents = 0;
    const stats = runner.stats;
    runner
      .once(EVENT_RUN_BEGIN, () => {
        // console.log('start');
      })
      .on(EVENT_SUITE_BEGIN, () => {
        // console.log(`Suite start`)
      })
      .on(EVENT_SUITE_END, (suite) => {
        // console.log(`Suite end`)
        
      })
      .on(EVENT_TEST_PASS, test => {
        // Test#fullTitle() returns the suite name(s)
        // prepended to the test title
        // console.log(`${this.indent()}pass: ${test.fullTitle()}`);
        // Dispatch a test result report to Gadwick
        reportResult(config, test.suite.title, true, version, "");
      })
      .on(EVENT_TEST_FAIL, (test, err) => {
        // console.log(
        //   `${this.indent()}fail: ${test.fullTitle()} - error: ${err.message}`
        // );
        // Dispatch a test result report to Gadwick
        reportResult(config, test.suite.title, false, version, err.message);
      })
      .once(EVENT_RUN_END, () => {
        // We WOULD send an entire report here, but cypress runs each spec independently
        // console.log(`end: ${stats.passes}/${stats.passes + stats.failures} ok`);
      })
  }
}

module.exports = MochaReporter;