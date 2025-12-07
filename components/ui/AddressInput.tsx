import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AddressInputProps {
    address: string;
    addressDetail: string;
    onAddressChange?: (address: string) => void;
    onAddressDetailChange: (detail: string) => void;
    onSearchPress: () => void;
    placeholder?: string;
    detailPlaceholder?: string;
}

export default function AddressInput({
    address,
    addressDetail,
    onAddressChange,
    onAddressDetailChange,
    onSearchPress,
    placeholder = '주소를 입력해주세요.',
    detailPlaceholder = '상세 주소',
}: AddressInputProps) {
    return (
        <View>
            {/* Main Address Search Input */}
            <TouchableOpacity
                onPress={onSearchPress}
                className="flex-row items-center border border-gray-200 rounded-lg px-4 py-4 mb-2"
                style={{ backgroundColor: '#FAFAFA' }}
            >
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <Text
                    className={`flex-1 ml-2 text-base ${address ? 'text-gray-900' : 'text-gray-400'}`}
                >
                    {address || placeholder}
                </Text>
            </TouchableOpacity>

            {/* Detail Address Input */}
            <View
                className="border border-gray-200 rounded-lg px-4"
                style={{ backgroundColor: '#FAFAFA' }}
            >
                <TextInput
                    className="py-4 text-base text-gray-900"
                    placeholder={detailPlaceholder}
                    placeholderTextColor="#9CA3AF"
                    value={addressDetail}
                    onChangeText={onAddressDetailChange}
                />
            </View>
        </View>
    );
}
