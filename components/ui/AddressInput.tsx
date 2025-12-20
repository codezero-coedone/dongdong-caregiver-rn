import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AddressInputProps {
  address: string;
  addressDetail: string;
  onAddressDetailChange: (detail: string) => void;
  onSearchPress: () => void;
  placeholder?: string;
  detailPlaceholder?: string;
}

export default function AddressInput({
  address,
  addressDetail,
  onAddressDetailChange,
  onSearchPress,
  placeholder = '주소를 입력해주세요.',
  detailPlaceholder = '상세 주소',
}: AddressInputProps) {
  return (
    <View>
      {/* 주소 검색 */}
      <TouchableOpacity
        onPress={onSearchPress}
        style={{
          height: 48,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(112,115,124,0.16)',
          backgroundColor: '#FFFFFF',
          marginBottom: 8,
        }}
      >
        <Ionicons
          name="search"
          size={22}
          color="#171719"
          style={{ marginRight: 8 }}
        />

        <Text
          style={{
            flex: 1,
            paddingHorizontal: 4,
            fontSize: 16,
            lineHeight: 24,
            letterSpacing: 0.09,
            color: address ? '#171719' : 'rgba(55,56,60,0.28)',
          }}
        >
          {address || placeholder}
        </Text>
      </TouchableOpacity>

      {/* 상세 주소 */}
      <View>
        <TextInput
          style={{
            height: 48,
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(112,115,124,0.16)',
            backgroundColor: '#FFFFFF',
            marginBottom: 8,
          }}
          placeholder={detailPlaceholder}
          placeholderTextColor="rgba(55,56,60,0.28)"
          value={addressDetail}
          onChangeText={onAddressDetailChange}
        />
      </View>
    </View>
  );
}
