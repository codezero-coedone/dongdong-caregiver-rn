module.exports = function (api) {
    api.cache(true);
    return {
        // NativeWind v4: `nativewind/babel` must be a Babel *plugin* (not a preset).
        // If misconfigured, Android release builds can silently ignore `className` styles.
        presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
        plugins: [
            'nativewind/babel',
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
