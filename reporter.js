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
const version = require('../package.json').version;
const IDMapping = require('./mapFile')

// this reporter outputs test results, indenting two spaces per suite
class MyReporter {
  constructor(runner) {
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
          const id =  IDMapping.names[suite.title];
          console.dir(`Uploading results of the test suite for feature "${suite.title} (${id}"`);
          Axios.post(`http://localhost:3003/results`, { feature_id: id, passed: (stats.failures === 0), version})
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

module.exports = MyReporter;