import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    getLanguageOption,
    LANGUAGE_OPTIONS,
    LanguageCode,
    useLanguageStore,
} from '../../store/languageStore';

interface LanguageSelectorProps {
    size?: 'small' | 'medium';
}

export default function LanguageSelector({ size = 'small' }: LanguageSelectorProps) {
    const { language, setLanguage } = useLanguageStore();
    const [modalVisible, setModalVisible] = useState(false);

    const currentLanguage = getLanguageOption(language);

    const handleSelect = (code: LanguageCode) => {
        setLanguage(code);
        setModalVisible(false);
    };

    const iconSize = size === 'small' ? 18 : 22;
    const fontSize = size === 'small' ? 14 : 16;

    return (
        <>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Ionicons name="globe-outline" size={iconSize} color="#3B82F6" />
                <Text style={[styles.triggerText, { fontSize }]}>
                    {currentLanguage.code.toUpperCase()}
                </Text>
                <Ionicons name="chevron-down" size={iconSize - 4} color="#6B7280" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>언어 선택</Text>
                                <Text style={styles.modalSubtitle}>Select Language</Text>
                            </View>

                            <View style={styles.optionsList}>
                                {LANGUAGE_OPTIONS.map((option) => {
                                    const isSelected = option.code === language;
                                    return (
                                        <TouchableOpacity
                                            key={option.code}
                                            style={[
                                                styles.optionItem,
                                                isSelected && styles.optionItemSelected,
                                            ]}
                                            onPress={() => handleSelect(option.code)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.optionContent}>
                                                <Text
                                                    style={[
                                                        styles.optionLabel,
                                                        isSelected && styles.optionLabelSelected,
                                                    ]}
                                                >
                                                    {option.nativeLabel}
                                                </Text>
                                                <Text style={styles.optionSubLabel}>
                                                    {option.label}
                                                </Text>
                                            </View>
                                            {isSelected && (
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={24}
                                                    color="#3B82F6"
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        minWidth: 70,
    },
    triggerText: {
        flexShrink: 0,
        fontWeight: '600',
        color: '#374151',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        maxWidth: 320,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    optionsList: {
        padding: 8,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginVertical: 2,
    },
    optionItemSelected: {
        backgroundColor: '#EFF6FF',
    },
    optionContent: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    optionLabelSelected: {
        color: '#3B82F6',
    },
    optionSubLabel: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 2,
    },
});
