const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseWebpackConfig = require('./webpack.config.base');

const config = {
  // devtool: 'inline-source-map',
  devtool: 'cheap-module-eval-source-map',
  entry: ['react-hot-loader/patch', './docs/index.js'],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'docs/index.html',
      inject: true,
      chunksSortMode: 'dependency',
    }),
  ],
  cache: true,
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false,
    },
    runtimeChunk: true,
  },
  devServer: {
    hot: true,
    compress: true,
    open: true,
    inline: true,
    overlay: true,
    stats: 'errors-only',
    port: 3000,
  },
};

module.exports = merge(baseWebpackConfig, config);
