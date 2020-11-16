const config = require('config');

exports.config = {
    tests: './tests/**/*.js',
    helpers: {
        WebDriver: {
            url: 'vk.com',
            browser: 'chrome',
            windowSize: "maximize",
            restart: true,
            waitForTimeout: 20000,
            desiredCapabilities: {
                chromeOptions: {
                    args: [
                        '--disable-gpu',
                        'disable-infobars',
                        'window-size=1920,1080',
                        'codeceptjs-type',
                        'lang=en',
                    ],
                },
            },
        }
    },
    include: {
        I: './steps_file.js',
    },
    bootstrap: false,
    teardown: false,
    timeouts: {
        script: 60000,
        pageload: 20000,
        implicit: 5000
    },
    plugins: {
        screenshotOnFail: {
            enabled: true,
        },
        autoDelay: {
            enabled: true
        },
        allure: {
            outputDir: "./reports/allure",
            enabled: true
        }
    },
    timeout: 20000,
    name: 'Test wisebits',
};
