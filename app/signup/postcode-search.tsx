/**
 * Daum Postcode Screen
 * 
 * Using @actbase/react-daum-postcode library for Korean address search.
 */

import Postcode from '@actbase/react-daum-postcode';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

export default function PostcodeSearchScreen() {
    const router = useRouter();
    const { setCaregiverInfo, caregiverInfo } = useAuthStore();

    const handleSelected = useCallback((data: any) => {
        console.log('Address selected:', data);

        // Use road address if available, otherwise use jibun address
        const selectedAddress = data.roadAddress || data.jibunAddress || data.address;
        console.log('Selected address:', selectedAddress);

        if (caregiverInfo) {
            setCaregiverInfo({
                ...caregiverInfo,
                address: selectedAddress,
            });
        } else {
            setCaregiverInfo({
                name: '',
                rrnFront: '',
                rrnBack: '',
                phone: '',
                address: selectedAddress,
                addressDetail: '',
                criminalRecordFile: null,
            });
        }

        router.back();
    }, [caregiverInfo, setCaregiverInfo, router]);

    const handleError = (error: unknown) => {
        console.error('Postcode error:', error);
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.title}>주소 검색</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Postcode Component */}
            <Postcode
                style={styles.postcode}
                jsOptions={{ animation: true }}
                onSelected={handleSelected}
                onError={handleError}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
    },
    placeholder: {
        width: 32,
    },
    postcode: {
        flex: 1,
        width: '100%',
    },
});
