import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // UX polish: prevent IME/keyboard UI from leaking into onboarding screens.
    Keyboard.dismiss();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>로그인</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 본문 */}
      <View style={styles.content}>
        {/* 타이틀 */}
        <Text style={styles.title}>실시간 확인으로 안심</Text>

        {/* 설명 */}
        <Text style={styles.description}>
          현재 돌봄 상황을 언제든 확인하세요.{'\n'}
          간병 진행 현황, 간병일지, 주요 알림까지 실시간으로 공유되어 멀리
          있어도 안심할 수 있어요.
        </Text>

        {/* 이미지 */}
        <View style={styles.imageWrapper}>
          <Image
            source={require('@/assets/images/onboarding-2.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={{ flex: 1 }} />
      </View>

      {/* 하단 CTA (스샷 기준: 다음) */}
      <View style={styles.footer}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="다음"
          style={styles.button}
          activeOpacity={0.9}
          onPress={() => router.push('/permission?next=/onboarding/step3')}
        >
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ===== Layout ===== */
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ===== Header ===== */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#70737C29',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },

  /* ===== Content ===== */
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  title: {
    marginTop: 60,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 32,
    textAlign: 'center',
    color: '#171719',
  },

  description: {
    marginTop: 42,
    maxWidth: 335,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    textAlign: 'center',
    color: '#171719',
  },

  imageWrapper: {
    marginTop: 80,
    justifyContent: 'center',
  },
  image: {
    width: 130,
    height: 120,
  },

  /* ===== Footer CTA ===== */
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

});
