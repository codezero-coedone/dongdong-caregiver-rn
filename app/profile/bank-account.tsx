import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';

type BankAccount = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

export default function BankAccountScreen() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s: any) => s.isLoggedIn);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');

  function unwrapData<T>(resData: unknown): T {
    const anyRes = resData as any;
    if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
      return anyRes.data as T;
    }
    return anyRes as T;
  }

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    if (!isLoggedIn) {
      setLoading(false);
      setError('로그인이 필요합니다.');
      return () => {
        alive = false;
      };
    }
    (async () => {
      try {
        const res = await apiClient.get('/caregivers/bank-account');
        const data = unwrapData<Partial<BankAccount>>((res as any)?.data);
        if (!alive) return;
        setBankName(String(data?.bankName ?? ''));
        setAccountNumber(String(data?.accountNumber ?? ''));
        setAccountHolder(String(data?.accountHolder ?? ''));
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message ||
            e?.message ||
            '계좌 정보를 불러오지 못했습니다.',
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  const handleSave = async () => {
    if (!isLoggedIn) {
      Alert.alert('안내', '로그인이 필요합니다.');
      return;
    }
    const payload: BankAccount = {
      bankName: String(bankName || '').trim(),
      accountNumber: String(accountNumber || '').replace(/[^\d]/g, ''),
      accountHolder: String(accountHolder || '').trim(),
    };
    if (!payload.bankName || !payload.accountNumber || !payload.accountHolder) {
      Alert.alert('안내', '은행/계좌번호/예금주를 모두 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      await apiClient.put('/caregivers/bank-account', payload);
      Alert.alert('완료', '출금 계좌가 저장되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert(
        '실패',
        e?.response?.data?.message || e?.message || '저장에 실패했습니다.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.title}>출금 계좌 설정</Text>
        <Text style={styles.desc}>
          정산 지급을 위해 출금 계좌 정보를 등록해주세요.
        </Text>

        {loading ? (
          <Text style={styles.muted}>불러오는 중...</Text>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <View style={styles.form}>
          <Input
            label="은행"
            placeholder="예) 국민은행"
            value={bankName}
            onChangeText={setBankName}
          />
          <Input
            label="계좌번호"
            placeholder="숫자만 입력"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="number-pad"
          />
          <Input
            label="예금주"
            placeholder="예) 홍길동"
            value={accountHolder}
            onChangeText={setAccountHolder}
          />
        </View>

        <View style={styles.cta}>
          <Button
            title={saving ? '저장 중...' : '저장'}
            onPress={handleSave}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  desc: { marginTop: 8, fontSize: 14, color: '#6B7280' },
  muted: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  error: { marginTop: 12, fontSize: 14, color: '#EF4444' },
  form: { marginTop: 16, gap: 12 },
  cta: { marginTop: 20, marginBottom: 24 },
});

