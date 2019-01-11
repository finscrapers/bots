const yahoo = require('../src/yahoo');

test('works', async () => {
  const symbols = ['AAPL', 'AMZN', 'FB'];
  const data = await yahoo(symbols);
  expect(data).toEqual('Mark');
});

describe('Google', () => {
  beforeAll(async () => {
    await page.goto('https://google.com');
  });

  it('should display "google" text on page', async () => {
    await expect(page).toMatch('google');
  });
});
