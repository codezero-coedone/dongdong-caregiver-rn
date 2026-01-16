import LogoHorizontal from '@/assets/images/logo-horizontal.svg';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface HeaderWithLogoProps {
    onNotificationPress?: () => void;
    showNotification?: boolean;
}

export default function HeaderWithLogo({
    onNotificationPress,
    showNotification = true,
}: HeaderWithLogoProps) {
    return (
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <LogoHorizontal width={120} height={32} />
            </View>

            {showNotification && (
                <TouchableOpacity style={styles.alertButton} onPress={onNotificationPress}>
                    <Ionicons name="notifications-outline" size={24} color="#374151" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    alertButton: {
        padding: 8,
    },
});
