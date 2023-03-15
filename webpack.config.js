const path = require('path');
const Dotenv = require('dotenv-webpack');


module.exports = {
    entry: './scripts/chat.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist')
        },
        port: 5000,
        open: true,
        hot: true,
        compress: true,
        historyApiFallback: true
    },
    module: {
        rules: [
            {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                presets: ['@babel/preset-env'],
                plugins: [
                    ['@babel/plugin-transform-runtime', { regenerator: true }],
                    ['@babel/plugin-proposal-class-properties', { loose: true }],
                    [
                        "@babel/plugin-proposal-private-property-in-object",
                        { "loose": true }
                      ],
                      
                      [
                        "@babel/plugin-proposal-private-methods",
                        { "loose": true }
                      ]
                      
                ],
                },
            },
            },
            {
            test: /\.env$/,
            use: [
                {
                loader: 'raw-loader',
                options: {
                    esModule: false,
                },
                },
            ],
            },
        ],
        },

    plugins: [
        new Dotenv()
    ]
};