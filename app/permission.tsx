import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { devlog, isDevtoolsEnabled } from '@/services/devlog';

// Shared gate flag (aligned with Guardian + SEALED docs).
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';
// Legacy key kept for migration (older builds wrote this).
const LEGACY_ONBOARDING_PERMISSION_COMPLETE_KEY = 'onboarding_permission_complete';

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
  const DEVTOOLS_ENABLED = isDevtoolsEnabled();

  const nextPath = (() => {
    const p = String(nextRaw || '').trim();
    // Deterministic safety: only allow in-app absolute paths (no scheme, no traversal).
    if (!p.startsWith('/')) return '/onboarding/step3';
    if (p.includes('://')) return '/onboarding/step3';
    return p;
  })();

  // 1-time gate: if already completed, skip immediately.
  useEffect(() => {
    // UX polish: prevent IME/keyboard UI from leaking into permission screen.
    Keyboard.dismiss();
    let mounted = true;
    const run = async () => {
      try {
        const v = await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY);
        if (!mounted) return;
        if (v === '1' || v === 'true') {
          router.replace(nextPath);
          return;
        }

        // Migration: old builds stored a different key; accept it and upgrade in-place.
        const legacy = await SecureStore.getItemAsync(
          LEGACY_ONBOARDING_PERMISSION_COMPLETE_KEY,
        );
        if (!mounted) return;
        if (legacy === '1' || legacy === 'true') {
          try {
            await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, '1');
          } catch {
            // ignore
          }
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

  const continueAnyway = async () => {
    // Deterministic escape hatch: permission step must never block onboarding.
    try {
      // Write both keys once (forward/backward compatible).
      await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, '1');
      await SecureStore.setItemAsync(LEGACY_ONBOARDING_PERMISSION_COMPLETE_KEY, '1');
    } catch {
      // ignore
    }
    if (DEVTOOLS_ENABLED) {
      devlog({ scope: 'NAV', level: 'info', message: 'permission: acknowledge -> next' });
    }
    router.replace(nextPath);
  };

  // NOTE(SEALED UX): 선택 권한은 “필요 시점(기능 진입 시)”에만 요청한다.
  // - 온보딩 권한 페이지는 안내(1회) 역할만 수행 (팝업 폭탄 방지)
  // - 실제 권한 요청은 각 기능에서 JIT 방식으로 수행

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.frame}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>권한 동의</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
      >
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
        {/* Design: single primary CTA (confirm) */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => void continueAnyway()}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>확인</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 375,
    alignSelf: 'center',
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
    backgroundColor: '#0066FF',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGhost: {
    marginTop: 12,
    backgroundColor: '#F3F4F6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  buttonTextGhost: {
    color: '#111827',
  },
});
