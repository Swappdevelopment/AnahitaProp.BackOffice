var webpack = require('webpack');
const path = require('path');

const ExtractTextPlugin = require("extract-text-webpack-plugin");
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const ROOT_PATH = path.resolve(__dirname, 'wwwroot');
const FEND_PATH = path.resolve(__dirname, 'Frontend');

const isProd = (process.argv.indexOf('-p') >= 0);

const plugins = [
    new ExtractTextPlugin({
        filename: isProd ? '[name].min.css' : '[name].css',
        allChunks: true
    }),
    new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.min\.css$/,
        cssProcessorOptions: { discardComments: { removeAll: true } }
    }),
    new webpack.optimize.UglifyJsPlugin({
        include: /\.min\.js$/,
        minimize: true
    })
];


if (isProd) {

    console.log('Is Production');

    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    }));
}

const config = {

    node: {
        dns: 'mock',
        net: 'mock'
    },

    entry: {
        main: [
            FEND_PATH + '/index.jsx'
        ],
        vendor: [
            'fetch',
            'bootstrap/dist/css/bootstrap.css',
            'react-datepicker/dist/react-datepicker.css'

        ]
    },
    output: {
        path: ROOT_PATH + '/dist',
        filename: isProd ? '[name].min.js' : '[name].js',
        publicPath: '/dist/'
    },
    module: {
        loaders: [
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                loader: 'url-loader',
                options: {
                    limit: 50000,
                    name: 'assets/[name]_[hash].[ext]'
                }
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader",
                options: {
                    limit: 10000,
                    name: 'assets/[name]_[hash].[ext]',
                    mimetype: 'application/font-woff'
                }
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader",
                options: {
                    limit: 50000,
                    name: 'assets/[name]_[hash].[ext]'
                }
            },
            {
                test: /\.(js|jsx)$/,
                include: FEND_PATH,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-2']
                }
            },
            {
                test: /\.(css|scss)$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'sass-loader']
                })
            },
            // {
            //     test: /\.(css|scss)$/,
            //     loader: 'postcss-loader',
            //     options: {
            //         ident: 'postcss',
            //         plugins: (loader) => [
            //             require('autoprefixer')()
            //         ]
            //     }
            // }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    plugins: plugins
};

module.exports = config;