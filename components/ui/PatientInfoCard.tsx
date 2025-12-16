import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

interface Patient {
    matchCount: number;
    name: string;
    age: number;
    gender: string;
    height: string;
    weight: string;
    diagnosis: string;
}

interface PatientInfoCardProps extends ViewProps {
    patient: Patient;
    isMatched?: boolean;
}

export default function PatientInfoCard({ patient, isMatched = false, style, ...props }: PatientInfoCardProps) {
    // Helper to render blurred text placeholder
    const BlurredText = ({ width = 60 }: { width?: number }) => (
        <View style={[styles.blurContainer, { width }]} />
    );

    return (
        <View style={[styles.card, style]} {...props}>
            {/* Match Badge */}
            <View style={styles.matchBadge}>
                <Text style={styles.matchBadgeText}>폐암 {patient.matchCount}기</Text>
            </View>

            {/* Patient Name */}
            <View style={styles.nameContainer}>
                {isMatched ? (
                    <Text style={styles.patientName}>
                        {patient.name} ({patient.age}세, {patient.gender})
                    </Text>
                ) : (
                    <View style={styles.blurredNameRow}>
                        <BlurredText width={80} />
                        <Text style={styles.patientNameGenerated}>
                            ({patient.age}세, {patient.gender})
                        </Text>
                    </View>
                )}
            </View>

            {/* Patient Details */}
            <View style={styles.patientDetails}>
                <View style={styles.patientDetailRow}>
                    <Text style={styles.patientDetailLabel}>키</Text>
                    <Text style={styles.patientDetailValue}>{patient.height}</Text>
                </View>
                <View style={styles.patientDetailRow}>
                    <Text style={styles.patientDetailLabel}>몸무게</Text>
                    <Text style={styles.patientDetailValue}>{patient.weight}</Text>
                </View>
                <View style={styles.patientDetailRow}>
                    <Text style={styles.patientDetailLabel}>진단명</Text>
                    {isMatched ? (
                        <Text style={styles.patientDetailValue}>{patient.diagnosis}</Text>
                    ) : (
                        <BlurredText width={50} />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
    },
    matchBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 8,
    },
    matchBadgeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    nameContainer: {
        marginBottom: 12,
        minHeight: 24, // Ensure line height consistency
    },
    patientName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    blurredNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    patientNameGenerated: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    blurContainer: {
        height: 20,
        backgroundColor: '#E5E7EB', // Gray placeholder
        borderRadius: 4,
    },
    patientDetails: {
        gap: 8,
    },
    patientDetailRow: {
        flexDirection: 'row',
        alignItems: 'center', // Ensure vertical alignment for blurred blocks
        minHeight: 20,
    },
    patientDetailLabel: {
        width: 60,
        fontSize: 14,
        color: '#6B7280',
    },
    patientDetailValue: {
        fontSize: 14,
        color: '#111827',
    },
});
