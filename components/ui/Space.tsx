import React from 'react';
import { View, ViewProps } from 'react-native';

interface SpaceProps extends ViewProps {
    x?: number;
    y?: number;
}

export default function Space({ x = 0, y = 0, style, ...props }: SpaceProps) {
    return (
        <View
            style={[
                {
                    width: x || undefined,
                    height: y || undefined,
                },
                style,
            ]}
            {...props}
        />
    );
}
