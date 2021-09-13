const chromium = require("chrome-aws-lambda");

async function screenshot(url, component) {
    const browser = await chromium.puppeteer.launch({
        executablePath: await chromium.executablePath,
        args: chromium.args,
        headless: chromium.headless,
    });

    const page = await browser.newPage();

    page.setJavaScriptEnabled(true);
    component = !component ? "#root" : component === 'table' ? 'table' : `#${component}`;
    await page.goto(`https://${url}/`, {
        waitUntil: ["load", "networkidle0"],
        timeout: 8500,
    });

    await page.waitForSelector(component);
    const element = await page.$(component);

    let options = {
        type: "png",
        encoding: "base64",
    };

    let output = await element.screenshot(options);

    await browser.close();

    return output;
}

exports.handler = async (event, context) => {
    const component = event.path.slice(12);
    const output = await screenshot(event.headers.host, component);
    return {
        statusCode: 200,
        headers: {
            "content-type": `image/png`,
        },
        body: output,
        isBase64Encoded: true,
    };
};
