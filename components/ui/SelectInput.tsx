import React, { useState } from 'react';
import { FlatList, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface SelectOption {
    label: string;
    value: string;
}

interface SelectInputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    options: SelectOption[];
    onSelect: (value: string) => void;
    error?: string;
    isValid?: boolean;
    containerClassName?: string;
}

const ErrorIcon = () => (
    <View
        style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <View
            style={{
                width: 18,
                height: 18,
                backgroundColor: '#EF4444',
                borderRadius: 9,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>!</Text>
        </View>
    </View>
);

const SuccessIcon = () => (
    <View
        style={{
            width: 22,
            height: 22,
            backgroundColor: '#3B82F6',
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
    </View>
);

const ChevronDownIcon = ({ color = '#0066FF' }: { color?: string }) => (
    <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color, fontSize: 18 }}>▾</Text>
    </View>
);

const SelectInput = ({
    label,
    placeholder = '선택해주세요.',
    value,
    options,
    onSelect,
    error,
    isValid,
    containerClassName = '',
}: SelectInputProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);
    const showSuccessIcon = isValid && !error;
    const showErrorIcon = !!error;

    const handleSelect = (selectedValue: string) => {
        onSelect(selectedValue);
        setIsModalVisible(false);
    };

    return (
        <View className={`mb-4 ${containerClassName}`}>
            {label && (
                <Text className="text-sm font-bold mb-2 text-gray-800">
                    {label} <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
            )}
            <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                style={{
                    height: 56,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: error ? '#FCA5A5' : '#E5E7EB',
                    borderRadius: 12,
                    backgroundColor: error ? '#FEF2F2' : 'white',
                }}
            >
                <Text
                    style={{
                        fontSize: 16,
                        color: selectedOption ? '#1F2937' : '#9CA3AF',
                        flex: 1,
                    }}
                >
                    {selectedOption?.label || placeholder}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {showErrorIcon && <ErrorIcon />}
                    {showSuccessIcon && <SuccessIcon />}
                    <ChevronDownIcon color={error ? '#EF4444' : '#0066FF'} />
                </View>
            </TouchableOpacity>
            {error && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</Text>}

            <Modal
                visible={isModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'flex-end',
                    }}
                    onPress={() => setIsModalVisible(false)}
                >
                    <Pressable
                        style={{
                            backgroundColor: 'white',
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            maxHeight: '50%',
                            paddingBottom: 34,
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View
                            style={{
                                padding: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: '#E5E7EB',
                                alignItems: 'center',
                            }}
                        >
                            <View
                                style={{
                                    width: 40,
                                    height: 4,
                                    backgroundColor: '#D1D5DB',
                                    borderRadius: 2,
                                    marginBottom: 12,
                                }}
                            />
                            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
                                {label || '선택'}
                            </Text>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleSelect(item.value)}
                                    style={{
                                        paddingVertical: 16,
                                        paddingHorizontal: 20,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: item.value === value ? 'rgba(0, 102, 255, 0.05)' : 'white',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: item.value === value ? '#0066FF' : '#1F2937',
                                            fontWeight: item.value === value ? '600' : '400',
                                        }}
                                    >
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <Text style={{ color: '#0066FF', fontSize: 18, fontWeight: 'bold' }}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => (
                                <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

export default SelectInput;
