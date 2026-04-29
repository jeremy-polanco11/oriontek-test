const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  const isDev = !isProd;

  const styleLoader = isDev ? 'style-loader' : MiniCssExtractPlugin.loader;

  return {
    mode: isProd ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src/main.tsx'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
      chunkFilename: isProd
        ? 'assets/[name].[contenthash:8].chunk.js'
        : 'assets/[name].chunk.js',
      assetModuleFilename: 'assets/media/[name].[hash:8][ext]',
      publicPath: '/',
      clean: true,
    },
    devtool: isProd ? 'source-map' : 'cheap-module-source-map',
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: { loader: 'babel-loader', options: { cacheDirectory: true } },
        },
        {
          test: /\.module\.s[ac]ss$/,
          use: [
            styleLoader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: isDev
                    ? '[name]__[local]--[hash:base64:5]'
                    : '[hash:base64:8]',
                },
                importLoaders: 2,
              },
            },
            'postcss-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.s[ac]ss$/,
          exclude: /\.module\.s[ac]ss$/,
          use: [styleLoader, 'css-loader', 'postcss-loader', 'sass-loader'],
        },
        {
          test: /\.css$/,
          use: [styleLoader, 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|webp|avif)$/,
          type: 'asset/resource',
        },
        {
          test: /\.svg$/,
          type: 'asset/resource',
        },
        {
          test: /\.(woff2?|ttf|otf|eot)$/,
          type: 'asset/resource',
          generator: { filename: 'assets/fonts/[name].[hash:8][ext]' },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
        inject: 'body',
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
      }),
      new ForkTsCheckerWebpackPlugin({
        typescript: { configFile: path.resolve(__dirname, 'tsconfig.json') },
      }),
      isProd &&
        new MiniCssExtractPlugin({
          filename: 'assets/[name].[contenthash:8].css',
          chunkFilename: 'assets/[name].[contenthash:8].chunk.css',
        }),
      isDev && new ReactRefreshWebpackPlugin({ overlay: false }),
    ].filter(Boolean),
    optimization: {
      splitChunks: isProd ? { chunks: 'all' } : false,
      runtimeChunk: isProd ? 'single' : false,
      moduleIds: 'deterministic',
    },
    devServer: {
      port: 3000,
      historyApiFallback: true,
      hot: true,
      open: false,
      client: { overlay: { errors: true, warnings: false } },
      static: { directory: path.resolve(__dirname, 'public') },
      proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:3010',
          pathRewrite: { '^/api': '' },
          changeOrigin: true,
        },
      ],
    },
    performance: {
      hints: isProd ? 'warning' : false,
      maxAssetSize: 512_000,
      maxEntrypointSize: 512_000,
    },
  };
};
