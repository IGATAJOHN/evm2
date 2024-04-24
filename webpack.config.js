const path = require('path');

module.exports = {
    entry: './src/app.js', // Entry point of your application
    output: {
        filename: 'app.bundle.js', // Output bundle file name
        path: path.resolve(__dirname, 'static/js'), // Output directory
    },
    mode: 'development',
    module: {
        rules: [
            // Add loaders for different file types
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        // Remove the 'alias' section
    }
};
