const webpack = require('webpack');
const package = require('./package');


const banner = `${package.name} ${package.version} - ${package.description}\nCopyright (c) ${ new Date().getFullYear() } ${package.author} - ${package.homepage}\nLicense: ${package.license}`;

module.exports = [{
  'context': __dirname + '/src',
  'entry': './parallux.js',
  'output': {
    'path': __dirname + '/dist',
    'filename': `${package.name}.min.js`,
    'library': `Parallux`,
    'libraryTarget': 'umd'
  },
  'module': {
    'loaders': [{
      'test': /\.js$/,
      'exclude': /node_modules/,
      'loader': 'babel'
    }]
  },
  'plugins': [
    new webpack.BannerPlugin(banner)
  ],
  devServer: {
    contentBase: "./",
  }
}];
