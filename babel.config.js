module.exports = function (api) {
    api.cache(true);
    return {
        // NativeWind v4.x currently ships `nativewind/babel` as a *preset*
        // (it re-exports `react-native-css-interop/babel`, which returns `{ plugins: [...] }`).
        // If registered as a plugin, Metro bundling can fail with:
        //   ".plugins is not a valid Plugin property"
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
