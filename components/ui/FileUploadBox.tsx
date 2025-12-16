import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface FileUploadBoxProps {
    file?: { uri: string; name: string } | null;
    onPress: () => void;
    label?: string;
}

export default function FileUploadBox({
    file,
    onPress,
    label = '파일 업로드하기',
}: FileUploadBoxProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="border border-dashed border-gray-300 rounded-lg py-8 items-center justify-center"
            style={{ backgroundColor: '#FAFAFA' }}
        >
            {file ? (
                <View className="items-center">
                    <Ionicons name="document-text" size={32} color="#3B82F6" />
                    <Text className="text-gray-700 mt-2 text-sm" numberOfLines={1}>
                        {file.name}
                    </Text>
                    <Text className="text-blue-500 text-xs mt-1">탭하여 변경</Text>
                </View>
            ) : (
                <View className="items-center">
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center mb-2"
                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                    >
                        <Ionicons name="cloud-upload-outline" size={24} color="#3B82F6" />
                    </View>
                    <Text className="text-gray-400 text-sm">{label}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
