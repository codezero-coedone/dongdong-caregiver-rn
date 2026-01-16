import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguagePickerModal from '@/components/auth/LanguagePickerModal';
import { getAppLocale, setAppLocale, type AppLocale } from '@/services/localeService';

export default function Index() {
  const router = useRouter();
  const [locale, setLocale] = useState<AppLocale>('ko');
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    // UX polish: prevent IME/keyboard UI from leaking into onboarding screens.
    Keyboard.dismiss();
    void (async () => {
      const v = await getAppLocale();
      setLocale(v);
    })();
  }, []);

  const t = (() => {
    if (locale === 'en') {
      return {
        header: 'Login',
        title: '安心 with real-time updates',
        desc:
          'Check the current care status anytime.\n' +
          'Progress, daily journals and important notifications are shared in real time.',
        next: 'Next',
      };
    }
    return {
      header: '로그인',
      title: '실시간 확인으로 안심',
      desc:
        '현재 돌봄 상황을 언제든 확인하세요.\n' +
        '간병 진행 현황, 간병일지, 주요 알림까지 실시간으로 공유되어 멀리\n' +
        '있어도 안심할 수 있어요.',
      next: '다음',
    };
  })();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.frame}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>{t.header}</Text>
        <TouchableOpacity
          onPress={() => setLangOpen(true)}
          style={styles.langBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="언어 선택"
        >
          <Text style={styles.langText}>A</Text>
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <View style={styles.content}>
        {/* 타이틀 */}
        <Text style={styles.title}>{t.title}</Text>

        {/* 설명 */}
        <Text style={styles.description}>{t.desc}</Text>

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
          accessibilityLabel={t.next}
          style={styles.button}
          activeOpacity={0.9}
          onPress={() => router.push('/permission?next=/onboarding/step3')}
        >
          <Text style={styles.buttonText}>{t.next}</Text>
        </TouchableOpacity>
      </View>

      <LanguagePickerModal
        visible={langOpen}
        value={locale}
        onClose={() => setLangOpen(false)}
        onSelect={(v) => {
          setLocale(v);
          setLangOpen(false);
          void setAppLocale(v);
        }}
      />
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
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 375,
    alignSelf: 'center',
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
  headerSide: {
    width: 24,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  langBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: { fontSize: 14, fontWeight: '900', color: '#111827' },

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
    backgroundColor: '#0066FF',
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
