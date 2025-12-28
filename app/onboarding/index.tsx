import Button from '@/components/ui/Button';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>로그인</Text>
        <View style={styles.headerSide} />
      </View>

      {/* 본문 */}
      <View style={styles.content}>
        {/* 타이틀 */}
        <Text style={styles.title}>안심되는 돌봄 시작</Text>

        {/* 설명 */}
        <Text style={styles.description}>
          전문 간병인과의 연결을 쉽고 빠르게.{'\n'}
          필요한 돌봄을 정확히 이해하고, 가장 적합한 간병인을 추천해 안정적인
          돌봄을 시작할 수 있어요.
        </Text>

        {/* 이미지 */}
        <View style={styles.imageWrapper}>
          <Image
            source={require('@/assets/images/onboarding-1.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={{ flex: 1 }} />

        {/* 버튼 */}
        <View style={styles.buttonWrapper}>
          <Button
            title="다음"
            onPress={() => router.push('/onboarding/step2')}
          />
        </View>
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
    backgroundColor: '#FFFFFF',
  },
  headerSide: {
    width: 24,
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
    width: 154,
    height: 125,
  },

  buttonWrapper: {
    width: '100%',
  },
});
