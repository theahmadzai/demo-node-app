const environments = {};

environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'apple'
};

environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'apple'
};

let nodeEnv = typeof (process.env.NODE_ENV) == 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : null;

module.exports = typeof (environments[nodeEnv]) == 'object'
    ? environments[nodeEnv]
    : environments.staging;
