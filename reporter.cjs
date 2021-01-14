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
let version, IDMapping, config;
try
{
  version = require('../../package.json').version;
  config = require('../../gadwick-config.json');
}
catch (error)
{
  console.error(`Could not find required configuration files - make sure you have run "gadwick configure" and "gadwick update" before using this reporter.`)
}
const gadwickEndpoint = "https://3i07lk1jl8.execute-api.us-east-1.amazonaws.com";

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
        this.increaseIndent();
      })
      .on(EVENT_SUITE_END, (suite) => {
        // console.log(`Suite end`)
        this.decreaseIndent();
        // Dispatch a test result report to Gadwick
        if (suite.title.length > 0)
        {
          const id = config.idMap.names[suite.title];
          if (!id)
          {
            console.warn(`Could not find a Gadwick feature ID for "${suite.title}" - you may need to run "gadwick update"`)
          }
          console.log(`Uploading results of the test suite for feature "${suite.title} (${id})"`);
          Axios.post(`${gadwickEndpoint}/results`, { feature_id: id, passed: (stats.failures === 0), version, api_key: config.api_key, automated: "TRUE" })
        }
      })
      .on(EVENT_TEST_PASS, test => {
        // Test#fullTitle() returns the suite name(s)
        // prepended to the test title
        // console.log(`${this.indent()}pass: ${test.fullTitle()}`);
      })
      .on(EVENT_TEST_FAIL, (test, err) => {
        // console.log(
        //   `${this.indent()}fail: ${test.fullTitle()} - error: ${err.message}`
        // );
      })
      .once(EVENT_RUN_END, () => {
        // We WOULD send an entire report here, but cypress runs each spec independently
        // console.log(`end: ${stats.passes}/${stats.passes + stats.failures} ok`);
      })
  }

  indent() {
    return Array(this._indents).join('  ');
  }

  increaseIndent() {
    this._indents++;
  }

  decreaseIndent() {
    this._indents--;
  }
}

module.exports = MochaReporter;