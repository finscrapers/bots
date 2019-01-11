const withPuppeteer = require('./withPuppeteer');

const yahoo = async (page, {symbols}, status) => {
  var result = [];
  status('Visiting Yahoo Finance');
  await page.goto('https://finance.yahoo.com/');
  // Click on consent
  try {
    const consent = await page.$('button[name=agree]');
    await consent.click();
    await page.waitForSelector('#app');
  } catch (e) {
    status('No consent to agree');
  }
  for (const i in symbols) {
    status(`Visiting ${symbols[i]}`);
    await page.goto(`https://finance.yahoo.com/quote/${symbols[i]}`);

    // Scrape market data
    status('Visiting the sites');
    await page.waitForSelector('#Main table');
    result[i] = await page.$$eval(
      '#Main table tbody tr',
      (rows, symbols, i) => {
        var obj = {Symbol: symbols[i]};
        Array.from(rows).map(row => {
          obj[`${row.children[0].textContent}`] = `${
            row.children[1].textContent
          }`;
        });
        return obj;
      },
      symbols,
      i
    );
    await page.goto(`https://finance.yahoo.com/quote/${symbols[i]}/history`);
    await page.waitForSelector('#Main table');
    page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 10);
    });
    let prices = await page.$$eval(
      '#Main table tbody tr',
      (rows, symbols, i) => {
        let obj = {Symbol: symbols[i], Prices: []};
        Array.from(rows).map(row => {
          let price = {};
          price[`${row.children[0].textContent}`] = `${
            row.children[1].textContent
          }`;
          obj.Prices.push(price);
        });
        return obj;
      },
      symbols,
      i
    );
    Object.assign(result[i], prices);
  }
  status({data: result});
};

module.exports = withPuppeteer(yahoo);
