module.exports = {
    "env": {
        "mocha": true
    },
    "plugins": [
        "mocha"
    ],
    // "extends": "standard",
    "extends": [
        "standard",
        "plugin:mocha/recommended"
    ],
    rules: {
        'no-alert': 'error',
        // allow async-await
        // 'generator-star-spacing': 'off',
        'camelcase': 'off',
        'prefer-promise-reject-errors': 'warn',
        // allow debugger during development
        'no-debugger': 'error'
        // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
}
