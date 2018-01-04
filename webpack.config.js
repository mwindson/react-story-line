const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const packageInfo = require('./package.json')

module.exports = {
  context: __dirname,
  target: 'web',

  entry: ['react-hot-loader/patch', __dirname + '/app/index.tsx'],

  output: {
    path: path.resolve(__dirname, 'build', packageInfo.version),
    filename: '[name].js',
  },

  resolve: {
    modules: [
      path.resolve(__dirname, 'app'),
      'node_modules',
    ],
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'awesome-typescript-loader',
          options: {
            transpileOnly: true,
          },
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        test: /\.styl$/,
        loaders: ['style-loader', 'css-loader', 'stylus-loader'],
      },
      {
        test: /\.ya?ml$/,
        use: ['json-loader', 'yaml-loader'],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'game-engine',
      filename: 'index.html',
      template: path.resolve(__dirname, 'app/index.tmpl.html'),
      // chunks: ['commons', 'main'],
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],

  devServer: {
    contentBase: __dirname,
    host: '0.0.0.0',
    hot: true,
    port: 8082
  }
}