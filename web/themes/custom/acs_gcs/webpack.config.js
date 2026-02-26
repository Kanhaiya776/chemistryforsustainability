const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const TerserPlugin = require('terser-webpack-plugin');
const glob = require('glob');
const postcssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: {
      components: getScriptEntries(),
      ...getEntries(),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      devtoolModuleFilenameTemplate: isDevelopment
        ? info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
        : info => path.relative(__dirname, info.absoluteResourcePath).replace(/\\/g, '/'),
      assetModuleFilename: '[name].[ext]',
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    autoprefixer(),
                    postcssPresetEnv(),
                    cssnano({
                      preset: ['default', {
                        discardComments: {
                          removeAll: true,
                        },
                      }],
                    }),
                  ],
                },
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  includePaths: [path.resolve(__dirname, 'scss')],
                },
              },
            },
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[ext]',
          },
          exclude: /fonts/,
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[ext]',
          },
        },
      ],
    },
    devtool: 'cheap-module-source-map',
    resolve: {
      alias: {
        images: path.resolve(__dirname, 'images'),
        fonts: path.resolve(__dirname, 'fonts'),
      },
    },
    plugins: [
      new RemoveEmptyScriptsPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({ parallel: true }), new CssMinimizerPlugin(),],
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },
    performance: {
      hints: false,
    },
    stats: {
      children: false,
    },
  }
};

function getEntries() {
  const entries = {};
  const scssFiles = glob.sync('./scss/**/*.scss', {
  });

  const mainEntry = [];

  scssFiles.forEach(file => {
    const entryName = path.basename(file, '.scss');
    const isMainFile = entryName.startsWith('_');

    if (isMainFile) {
      mainEntry.push(`./${file}`);
    } else {
      const entryKey = entryName;
      entries[entryKey] = `./${file}`;
    }
  });

  if (mainEntry.length > 0) {
    entries['styles'] = mainEntry;
  }
  return entries;
}

function getScriptEntries() {
  const scriptFiles = glob.sync('./scripts/**/*.js');
  const filteredFiles = scriptFiles.filter(file => !file.includes('/plugins/'));
  return filteredFiles.map(file => `./${file}`);
}
