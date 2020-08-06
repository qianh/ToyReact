const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './index.jsx'
  },
  module: {
    rules: [{
      test: /\.js|.jsx$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            [
              "@babel/plugin-transform-react-jsx",
              {
                pragma: "ToyReact.createElement"
              }
            ]
          ]
        }
      }
    }]
  },
  mode: 'development',
  optimization: {
    minimize: false
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      filename: "index.html"
    })
  ]
}
