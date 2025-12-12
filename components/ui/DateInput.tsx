import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface DateInputProps {
    label?: string;
    placeholder?: string;
    value?: Date | null;
    onChange: (date: Date | null) => void;
    error?: string;
    isValid?: boolean;
    containerClassName?: string;
    minimumDate?: Date;
    maximumDate?: Date;
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

const formatDate = (date: Date | null | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const DateInput = ({
    label,
    placeholder = 'yyyy-mm-dd',
    value,
    onChange,
    error,
    isValid,
    containerClassName = '',
    minimumDate,
    maximumDate,
}: DateInputProps) => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(value || new Date());

    const showSuccessIcon = isValid && !error;
    const showErrorIcon = !!error;

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
            if (event.type === 'set' && selectedDate) {
                onChange(selectedDate);
            }
        } else {
            if (selectedDate) {
                setTempDate(selectedDate);
            }
        }
    };

    const handleConfirm = () => {
        onChange(tempDate);
        setShowPicker(false);
    };

    const handleCancel = () => {
        setTempDate(value || new Date());
        setShowPicker(false);
    };

    const openPicker = () => {
        setTempDate(value || new Date());
        setShowPicker(true);
    };

    return (
        <View className={`mb-4 ${containerClassName}`}>
            {label && (
                <Text className="text-sm font-bold mb-2 text-gray-800">
                    {label} <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
            )}
            <TouchableOpacity
                onPress={openPicker}
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
                        color: value ? '#1F2937' : '#9CA3AF',
                        flex: 1,
                    }}
                >
                    {value ? formatDate(value) : placeholder}
                </Text>
                {showErrorIcon && <ErrorIcon />}
                {showSuccessIcon && <SuccessIcon />}
            </TouchableOpacity>
            {error && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</Text>}

            {Platform.OS === 'ios' ? (
                <Modal
                    visible={showPicker}
                    transparent
                    animationType="fade"
                    onRequestClose={handleCancel}
                >
                    <Pressable
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            justifyContent: 'flex-end',
                        }}
                        onPress={handleCancel}
                    >
                        <Pressable
                            style={{
                                backgroundColor: 'white',
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                paddingBottom: 34,
                            }}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 16,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#E5E7EB',
                                }}
                            >
                                <TouchableOpacity onPress={handleCancel}>
                                    <Text style={{ color: '#6B7280', fontSize: 16 }}>취소</Text>
                                </TouchableOpacity>
                                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
                                    {label || '날짜 선택'}
                                </Text>
                                <TouchableOpacity onPress={handleConfirm}>
                                    <Text style={{ color: '#0066FF', fontSize: 16, fontWeight: '600' }}>확인</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={handleChange}
                                    minimumDate={minimumDate}
                                    maximumDate={maximumDate}
                                    locale="ko"
                                />
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            ) : (
                showPicker && (
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="default"
                        onChange={handleChange}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                    />
                )
            )}
        </View>
    );
};

export default DateInput;
