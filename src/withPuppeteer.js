const puppeteer = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');
const request = require('request');
const util = require('util');

async function launch({headless}) {
  let flag = [
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--debug-devtools',
    '--enable-automation',
    '--disable-dev-shm-usage'
  ];
  // TODO: use model to receive correct data
  //if (!headless) flag.push('--headless');
  return chromeLauncher.launch({
    chromeFlags: flag,
    enableExtensions: true,
    devtools: true
  });
}

module.exports = bot => {
  return (args, status) => {
    return new Promise(async resolve => {
      const chromeOpts = args.browser || {};
      const chrome = await launch(chromeOpts);
      const resp = await util.promisify(request)(
        `http://localhost:${chrome.port}/json/version`
      );
      const {webSocketDebuggerUrl} = JSON.parse(resp.body);
      const puppeteerOpts = {};
      if (args.browser && args.browser.sloMo)
        puppeteerOpts['sloMo'] = args.browser.sloMo;
      const browser = await puppeteer.connect({
        slowMo: 150,
        browserWSEndpoint: webSocketDebuggerUrl
      });
      /*
        Object.assign(puppeteerOpts, {
          browserWSEndpoint: webSocketDebuggerUrl,
          slowMo: 150
        })
      );

        */
      const page = await browser.newPage();
      await bot(page, args, status);
      await browser.close();
      resolve();
    });
  };
};
