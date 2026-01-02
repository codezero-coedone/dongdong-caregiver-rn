module.exports = function (api) {
    api.cache(true);
    return {
        // NativeWind v4:
        // - Keep `jsxImportSource: 'nativewind'` on the Expo preset.
        // - `nativewind/babel` must be used as a *preset* (it expands to underlying plugins).
        presets: [
            ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
            'nativewind/babel',
        ],
        plugins: [
            [
                'module-resolver',
                {
                    alias: {
                        '@': './',
                        '@/components': './components',
                        '@/constants': './constants',
                        '@/services': './services',
                        '@/store': './store',
                        '@/hooks': './hooks',
                    },
                },
            ],
            'react-native-reanimated/plugin',
        ],
    };
};
