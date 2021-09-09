const chromium = require("chrome-aws-lambda");

async function screenshot(component) {
    const browser = await chromium.puppeteer.launch({
        executablePath: await chromium.executablePath,
        args: chromium.args,
        headless: chromium.headless,
    });

    const page = await browser.newPage();

    page.setJavaScriptEnabled(true);
    component = !component ? "#root" : component == 'table' ? 'table' : `#${component}`;
    let response = await page.goto("https://mcq-schedule-cwc.netlify.app/", {
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
    component = event.path.slice(12);
    output = await screenshot(component);
    return {
        statusCode: 200,
        headers: {
            "content-type": `image/png`,
        },
        body: output,
        isBase64Encoded: true,
    };
};
