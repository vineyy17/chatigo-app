const path = require('path');


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
        port: 3000,
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