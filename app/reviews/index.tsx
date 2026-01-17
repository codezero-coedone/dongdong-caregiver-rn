import apiClient from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';

type CaregiverProfile = {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
};

type ReviewRow = {
  id: number;
  rating: number;
  content?: string;
  createdAt: string;
  caregiverName: string;
};

type CaregiverReviewsResponse = {
  caregiverId: number;
  averageRating: number;
  totalCount: number;
  reviews: ReviewRow[];
};

function unwrapData<T>(resData: unknown): T {
  const anyRes = resData as any;
  if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
    return anyRes.data as T;
  }
  return anyRes as T;
}

export default function ReviewsScreen() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CaregiverProfile | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);

  const average = useMemo(() => {
    if (!profile) return 0;
    return Number(profile.rating ?? 0);
  }, [profile]);

  const count = useMemo(() => {
    if (!profile) return 0;
    return Number(profile.reviewCount ?? 0);
  }, [profile]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    if (!isLoggedIn) {
      // Guard: never call protected endpoints when not authenticated.
      setProfile(null);
      setRows([]);
      setLoading(false);
      setError('로그인이 필요합니다.');
      return () => {
        alive = false;
      };
    }
    (async () => {
      try {
        const profRes = await apiClient.get('/caregivers/profile');
        const prof = unwrapData<CaregiverProfile>((profRes as any)?.data);
        if (!alive) return;
        setProfile(prof);

        const reviewRes = await apiClient.get(`/reviews/caregiver/${prof.id}`);
        const data = unwrapData<CaregiverReviewsResponse>((reviewRes as any)?.data);
        if (!alive) return;
        setRows(Array.isArray(data?.reviews) ? data.reviews : []);
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message || e?.message || '리뷰 조회에 실패했습니다.',
        );
        setProfile(null);
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  const renderStars = (rating: number) =>
    Array(5)
      .fill(0)
      .map((_, idx) => (
        <Ionicons
          key={idx}
          name="star"
          size={14}
          color={idx < rating ? '#F59E0B' : '#E5E7EB'}
        />
      ));

  const formatYmd = (iso: string | null | undefined): string => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{String(error)}</Text>
          <Text style={styles.helpText}>
            로그인/프로필이 없으면 조회가 불가능합니다. (간병인 프로필 등록 후 다시 시도)
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
        >
          <Text style={styles.title}>나의 리뷰</Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryName}>{profile?.name ?? '간병인'}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>평균</Text>
              <Text style={styles.summaryValue}>{average.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>({count}개)</Text>
            </View>
          </View>

          {rows.length > 0 ? (
            <View style={{ gap: 10 }}>
              {rows.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewTitle}>
                      {r.caregiverName || profile?.name || '리뷰'}
                    </Text>
                    <View style={styles.reviewStars}>{renderStars(r.rating)}</View>
                  </View>
                  <Text style={styles.reviewDate}>{formatYmd(r.createdAt)}</Text>
                  <Text style={styles.reviewBody}>
                    {r.content && r.content.trim() ? r.content : '내용 없음'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>아직 작성된 리뷰가 없습니다.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },
  errorText: { color: '#B91C1C', textAlign: 'center', marginBottom: 10 },
  helpText: { color: '#6B7280', textAlign: 'center', lineHeight: 18 },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  summaryName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  summaryLabel: { color: '#6B7280' },
  summaryValue: { color: '#111827', fontWeight: '800' },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewTitle: { fontWeight: '800', color: '#111827' },
  reviewStars: { flexDirection: 'row', gap: 1 },
  reviewDate: { marginTop: 6, fontSize: 12, color: '#9CA3AF' },
  reviewBody: { marginTop: 8, color: '#111827', lineHeight: 18 },
  emptyBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FAFAFA',
  },
  emptyText: { color: '#6B7280' },
});


