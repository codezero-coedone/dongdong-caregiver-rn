import { Ionicons } from '@expo/vector-icons';
import * as Camera from 'expo-camera';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

// Define permission types
type PermissionItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isOptional?: boolean;
};

const PermissionItem = ({ icon, title, description, isOptional = false }: PermissionItemProps) => (
  <View style={styles.itemContainer}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color="#333" />
    </View>
    <View style={styles.textContainer}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {isOptional && <Text style={styles.optional}>선택</Text>}
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  </View>
);

export default function PermissionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const nextRaw = typeof params.next === 'string' ? params.next : '';

  const nextPath = (() => {
    const p = String(nextRaw || '').trim();
    // Deterministic safety: only allow in-app absolute paths (no scheme, no traversal).
    if (!p.startsWith('/')) return '/onboarding/step3';
    if (p.includes('://')) return '/onboarding/step3';
    return p;
  })();

  // 1-time gate: if already completed, skip immediately.
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const v = await SecureStore.getItemAsync('onboarding_permission_complete');
        if (!mounted) return;
        if (v === '1' || v === 'true') {
          router.replace(nextPath);
        }
      } catch {
        // ignore
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [router, nextPath]);

  const requestPermissions = async () => {
    try {
      // 1. Location
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

      // 2. Camera
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();

      // 3. Media Library (Storage)
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();

      // 4. Contacts
      const { status: contactsStatus } = await Contacts.requestPermissionsAsync();

      // Note: Bluetooth and Phone permissions are often handled differently or implicitly 
      // depending on the specific usage (e.g., BLE scanning vs just using system dialer).
      // For this screen, we are requesting the core explicit permissions available in Expo.

      // After requesting, navigate to the next screen (e.g., Home or Login)
      // You might want to check statuses and alert the user if critical permissions are denied,
      // but for an "Agreement" screen, usually we just proceed or show a "Go to Settings" dialog.

      // For demonstration, we'll just navigate.
      // Mark permission step as completed (1-time gate)
      try {
        await SecureStore.setItemAsync('onboarding_permission_complete', '1');
      } catch {
        // ignore
      }
      router.replace(nextPath);

    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>권한 동의</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.mainTitle}>
          안전하고 간편한 동동 이용을 위해{'\n'}
          아래 권한 허용이 필요해요.
        </Text>

        <Text style={styles.sectionTitle}>선택 권한</Text>

        <PermissionItem
          icon="location-outline"
          title="위치"
          description="지도로 일감 찾기 및 동행 서비스에 사용"
          isOptional
        />
        <PermissionItem
          icon="camera-outline"
          title="카메라"
          description="이미지 업로드에 사용"
          isOptional
        />
        <PermissionItem
          icon="folder-outline"
          title="저장공간"
          description="이미지 업로드에 사용"
          isOptional
        />
        <PermissionItem
          icon="bluetooth-outline"
          title="블루투스"
          description="동행 서비스 위치 공유 시 사용"
          isOptional
        />
        <PermissionItem
          icon="call-outline"
          title="전화"
          description="환자/보호자/간병인 전화 시 사용"
          isOptional
        />
        <PermissionItem
          icon="person-circle-outline"
          title="연락처"
          description="환자/보호자/간병인 전화 시 사용"
          isOptional
        />
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          선택 권한의 경우 허용하지 않으셔도 앱 이용은 가능하나, 일부 서비스
          이용에 제한이 있을 수 있습니다.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions} activeOpacity={0.9}>
          <Text style={styles.buttonText}>확인</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#70737C29',
    backgroundColor: '#fff',
  },
  headerSide: {
    width: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 24,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 18,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 22,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  optional: {
    fontSize: 14,
    color: '#999',
  },
  description: {
    fontSize: 15,
    color: '#888',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
