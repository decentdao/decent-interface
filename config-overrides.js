const webpack = require('webpack');
module.exports = function override(config) {
  config.resolve.fallback = {
    util: require.resolve('util/'),
    url: require.resolve('url'),
    assert: require.resolve('assert'),
    buffer: require.resolve('buffer'),
    stream: require.resolve("stream-browserify"),
    crypto: require.resolve("crypto-browserify"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify"),
    'process/browser': require.resolve('process/browser.js')
  };
  config.ignoreWarnings = [/Failed to parse source map/];
  config.module.rules.push(
    {
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
      }
    }
  )
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  );

  return config;
}
