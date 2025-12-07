/**
 * Daum Postcode Component
 * 
 * WebView-based Korean address search using Daum Postcode API.
 * No external API key required.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export interface PostcodeData {
    zonecode: string;      // 우편번호
    address: string;       // 기본 주소
    addressEnglish: string;
    addressType: string;   // R: 도로명, J: 지번
    buildingName: string;  // 건물명
    apartment: string;     // 아파트 여부
    bcode: string;         // 법정동 코드
    bname: string;         // 법정동명
    bname1: string;
    bname2: string;
    sido: string;          // 시도
    sigungu: string;       // 시군구
    sigunguCode: string;
    roadAddress: string;   // 도로명 주소
    roadname: string;      // 도로명
    jibunAddress: string;  // 지번 주소
}

interface DaumPostcodeProps {
    visible: boolean;
    onClose: () => void;
    onSelected: (data: PostcodeData) => void;
}

// HTML for Daum Postcode embed
const POSTCODE_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>주소 검색</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        #container { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <div id="container"></div>
    <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
    <script>
        new daum.Postcode({
            oncomplete: function(data) {
                window.ReactNativeWebView.postMessage(JSON.stringify(data));
            },
            onclose: function(state) {
                if (state === 'FORCE_CLOSE') {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'close' }));
                }
            },
            width: '100%',
            height: '100%'
        }).embed(document.getElementById('container'));
    </script>
</body>
</html>
`;

export default function DaumPostcode({ visible, onClose, onSelected }: DaumPostcodeProps) {
    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.type === 'close') {
                onClose();
                return;
            }

            // Address selected
            onSelected(data as PostcodeData);
            onClose();
        } catch (error) {
            console.error('Postcode message error:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.title}>주소 검색</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* WebView */}
                <WebView
                    source={{ html: POSTCODE_HTML }}
                    onMessage={handleMessage}
                    style={styles.webview}
                    javaScriptEnabled
                    domStorageEnabled
                    originWhitelist={['*']}
                />
            </SafeAreaView>
        </Modal>
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
    webview: {
        flex: 1,
    },
});
