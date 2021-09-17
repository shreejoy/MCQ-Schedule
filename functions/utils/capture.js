const chromium = require("chrome-aws-lambda");

const capture = async (url, selector) => {
  const browser = await chromium.puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  page.setJavaScriptEnabled(true);
  await page.goto(url, {
    waitUntil: ["load", "networkidle0"],
    timeout: 8500,
  });

  await page.waitForSelector(selector);
  const element = await page.$(selector);

  let options = {
    type: "png",
    encoding: "base64",
  };

  let output = await element.screenshot(options);
  await browser.close();
  return output;
};

module.exports = capture;
