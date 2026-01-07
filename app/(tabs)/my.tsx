import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '@/services/apiClient';
import CaregivingJournalHome from '../caregiving-journal';
import { useAuthStore } from '@/store/authStore';
import { clearTokens } from '@/services/tokenService';

// 결정성/실데이터 정책:
// - MY 화면에서 mock 소개/수익 숫자를 노출하지 않는다.
// - 프로필/매칭/리뷰는 API 기반으로 표시하고, 수익은 완료된 매칭 기반 추정치로만 표기한다.
const DEFAULT_USER = {
  name: '간병인',
  isVerified: false,
  rating: 0,
  experience: '경력 -',
  certificates: '-',
  hasIntroduction: false,
};

const TABS = ['MY홈', '간병일지', '수익'];

export default function MyScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('MY홈');
  const [loadingMy, setLoadingMy] = useState(true);
  const [myError, setMyError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [myMatches, setMyMatches] = useState<any[]>([]);
  const [ongoingMatch, setOngoingMatch] = useState<any | null>(null);
  const [reviewPreview, setReviewPreview] = useState<any[]>([]);
  const logout = useAuthStore((s) => s.logout);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12);
  const tabBarHeight = 57 + bottomPad;
  const contentBottom = tabBarHeight + 24;

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '세션(토큰/로그인 상태)만 초기화합니다.\n로컬 데이터/설정은 유지됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              // Token reset (session only)
              await clearTokens();
            } catch {
              // ignore
            }
            try {
              logout();
            } catch {
              // ignore
            }
            // Deterministic: return to onboarding entry.
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  function unwrapData<T>(resData: unknown): T {
    const anyRes = resData as any;
    if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
      return anyRes.data as T;
    }
    return anyRes as T;
  }

  useEffect(() => {
    let alive = true;
    setLoadingMy(true);
    setMyError(null);
    if (!isLoggedIn) {
      // Guard: never call protected endpoints before auth is established.
      setProfile(null);
      setMyMatches([]);
      setOngoingMatch(null);
      setReviewPreview([]);
      setLoadingMy(false);
      return () => {
        alive = false;
      };
    }
    (async () => {
      try {
        const profRes = await api.get('/caregivers/profile');
        const prof = unwrapData<any>((profRes as any)?.data);
        if (!alive) return;
        setProfile(prof ?? null);

        const matchRes = await api.get('/my/matches');
        const matches = unwrapData<any[]>((matchRes as any)?.data);
        const arr = Array.isArray(matches) ? matches : [];
        setMyMatches(arr);
        const ongoing =
          arr.find((m) => m?.status !== 'COMPLETED' && m?.status !== 'CANCELLED') ??
          arr[0] ??
          null;
        setOngoingMatch(ongoing);

        if (prof?.id) {
          const reviewRes = await api.get(`/reviews/caregiver/${prof.id}`);
          const reviewData = unwrapData<any>((reviewRes as any)?.data);
          const rows = Array.isArray(reviewData?.reviews) ? reviewData.reviews : [];
          setReviewPreview(rows.slice(0, 3));
        } else {
          setReviewPreview([]);
        }
      } catch (e: any) {
        if (!alive) return;
        setMyError(
          e?.response?.data?.message || e?.message || 'MY 데이터를 불러오지 못했습니다.',
        );
        setProfile(null);
        setMyMatches([]);
        setOngoingMatch(null);
        setReviewPreview([]);
      } finally {
        if (alive) setLoadingMy(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  const user = useMemo(() => {
    if (!profile) return DEFAULT_USER;
    const years = Number(profile.experienceYears ?? 0);
    const exp = Number.isFinite(years) ? `경력 ${years}년` : DEFAULT_USER.experience;
    const cert = profile.licenseType
      ? profile.licenseType
      : DEFAULT_USER.certificates;
    return {
      name: profile.name ?? DEFAULT_USER.name,
      isVerified: Boolean(profile.isVerified),
      rating: Number(profile.rating ?? DEFAULT_USER.rating),
      experience: exp,
      certificates: cert,
      hasIntroduction: Boolean(profile.introduction),
    };
  }, [profile]);

  const formatYmd = (iso: string | null | undefined): string => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  };

  const calcDaysInclusive = (startIso: string, endIso: string): number => {
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
    const sUtc = Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate());
    const eUtc = Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
    const diff = Math.floor((eUtc - sUtc) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff + 1);
  };

  const earnings = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-based
    const monthStart = Date.UTC(y, m, 1);
    const monthEnd = Date.UTC(y, m + 1, 1) - 1;

    const items = (Array.isArray(myMatches) ? myMatches : [])
      .map((x) => {
        const end = new Date(String(x?.endDate || ''));
        const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
        const dailyRate = Number(x?.dailyRate ?? 0);
        const days =
          x?.startDate && x?.endDate
            ? calcDaysInclusive(String(x.startDate), String(x.endDate))
            : 0;
        const amount = Number.isFinite(dailyRate) ? dailyRate * days : 0;
        return {
          id: String(x?.id ?? ''),
          patientName: String(x?.patientName ?? '환자'),
          startDate: String(x?.startDate ?? ''),
          endDate: String(x?.endDate ?? ''),
          dailyRate: Number.isFinite(dailyRate) ? dailyRate : 0,
          days,
          amount,
          endUtc,
          status: String(x?.status ?? ''),
        };
      })
      .filter((x) => x.id && x.endUtc >= monthStart && x.endUtc <= monthEnd)
      .filter((x) => x.status === 'COMPLETED' || x.days > 0)
      .sort((a, b) => b.endUtc - a.endUtc);

    const total = items.reduce(
      (acc, x) => acc + (Number.isFinite(x.amount) ? x.amount : 0),
      0,
    );
    const workDays = items.reduce(
      (acc, x) => acc + (Number.isFinite(x.days) ? x.days : 0),
      0,
    );
    return { total, workDays, items };
  }, [myMatches]);

  const ongoingUi = useMemo(() => {
    if (!ongoingMatch) return null;
    const start = ongoingMatch.startDate ? new Date(ongoingMatch.startDate) : null;
    const end = ongoingMatch.endDate ? new Date(ongoingMatch.endDate) : null;
    const now = new Date();
    const daysRemaining =
      end && !Number.isNaN(end.getTime())
        ? Math.max(
            0,
            Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
          )
        : 0;
    const period =
      start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
        ? `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, '0')}.${String(
            start.getDate(),
          ).padStart(2, '0')}~${String(end.getMonth() + 1).padStart(2, '0')}.${String(
            end.getDate(),
          ).padStart(2, '0')}`
        : '-';
    return {
      matchId: ongoingMatch.id,
      daysRemaining,
      patientName: ongoingMatch.patientName ?? '환자',
      tags: ongoingMatch.careType ? [String(ongoingMatch.careType)] : [],
      period,
      diagnosis: '-',
    };
  }, [ongoingMatch]);

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Ionicons
          key={index}
          name="star"
          size={14}
          color={index < rating ? '#F59E0B' : '#E5E7EB'}
        />
      ));
  };

  function ReferralBanner() {
    return (
      <View style={styles.referralWrapper}>
        <View style={styles.referralBanner}>
          <View style={styles.referralTitleRow}>
            <Ionicons name="people" size={22} color="#2563EB" />
            <Text style={styles.referralTitle}>
              친구 초대하고 10,000원 받기!
            </Text>
          </View>

          <TouchableOpacity style={styles.referralCodeButton}>
            <Ionicons name="ticket-outline" size={20} color="#fff" />
            <Text style={styles.referralCodeText}>추천인 코드</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.referralButton}>
          <Ionicons name="ticket-outline" size={16} color="#3B82F6" />
          <Text style={styles.referralText}>추천인코드</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>MY</Text>

        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MY홈 Tab Content */}
      {activeTab === 'MY홈' && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: contentBottom }}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileLeft}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={28} color="#9CA3AF" />
                </View>
                <View style={styles.profileInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{user.name}</Text>
                    {user.isVerified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#3B82F6"
                      />
                    )}
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>평점</Text>
                    <Text style={styles.ratingValue}>{user.rating}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push('/profile/edit')}
              >
                <Text style={styles.editButtonText}>프로필 수정</Text>
                <Ionicons name="pencil" size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>근무 경력</Text>
                <Text style={styles.detailValue}>{user.experience}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>보유 자격증</Text>
                <Text style={styles.detailValue}>{user.certificates}</Text>
              </View>
            </View>
          </View>

          {/* ⭐ 추천인 배너 (여기 추가) */}
          <ReferralBanner />

          {/* 진행 중인 간병 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>진행 중인 간병</Text>
              <TouchableOpacity
                style={styles.moreLink}
                onPress={() => router.push('/care-history')}
              >
                <Text style={styles.moreLinkText}>이전 내역</Text>
                <Ionicons name="chevron-forward" size={16} color="#37383C9C" />
              </TouchableOpacity>
            </View>

            {ongoingUi ? (
              <View style={styles.ongoingCareCard}>
                {/* 남은 일수 */}
                <Text style={styles.daysRemaining}>
                  {ongoingUi.daysRemaining}일 남음
                </Text>

                {/* 환자 정보 */}
                <Text style={styles.ongoingPatientName}>
                  {ongoingUi.patientName}
                </Text>

                {/* 태그 */}
                <View style={styles.ongoingTags}>
                  {ongoingUi.tags.map((tag, index) => (
                    <View key={index} style={styles.ongoingTag}>
                      <Text style={styles.ongoingTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* 상세 정보 */}
                <View style={styles.ongoingDetails}>
                  <View style={styles.ongoingDetailRow}>
                    {/* 왼쪽 영역 */}
                    <View style={styles.ongoingDetailLeft}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#6B7280"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.ongoingDetailLabel}>기간</Text>
                    </View>

                    {/* 오른쪽 값 */}
                    <Text style={styles.ongoingDetailValue}>
                      {ongoingUi.period}
                    </Text>
                  </View>

                  <View style={styles.ongoingDetailRow}>
                    <View style={styles.ongoingDetailLeft}>
                      <Ionicons
                        name="medical-outline"
                        size={14}
                        color="#6B7280"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.ongoingDetailLabel}>병명</Text>
                    </View>
                    <Text style={styles.ongoingDetailValue}>
                      {ongoingUi.diagnosis}
                    </Text>
                  </View>
                </View>

                {/* 버튼 */}
                <View style={styles.ongoingButtons}>
                  <TouchableOpacity
                    style={styles.writeJournalButton}
                    onPress={() =>
                      ongoingUi.matchId
                        ? router.push(
                            `/caregiving-journal?matchId=${String(ongoingUi.matchId)}`,
                          )
                        : setActiveTab('간병일지')
                    }
                  >
                    <Text style={styles.writeJournalButtonText}>
                      일지 작성하기
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.viewDetailButton}
                    onPress={() => router.push('/care-history/detail')}
                  >
                    <Text style={styles.viewDetailButtonText}>상세보기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.actionCard}>
                <View style={styles.actionCardContent}>
                  <Text style={styles.actionCardTitle}>간병 지원하기</Text>
                  <Text style={styles.actionCardDesc}>
                    홈에서 요청 중인 매칭에{'\n'}지원할 수 있어요/
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* 나의 소개 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>나의 소개</Text>
              <TouchableOpacity
                style={styles.editLink}
                onPress={() => router.push('/profile/introduction')}
              >
                <Text style={styles.editLinkText}>
                  {user.hasIntroduction ? '편집' : '등록'}
                </Text>
                <Ionicons name="pencil" size={14} color="#171719" />
              </TouchableOpacity>
            </View>

            {user.hasIntroduction ? (
              <View style={styles.introductionCard}>
                {/* 자기소개 */}
                <View style={styles.introSection}>
                  <Text style={styles.introLabel}>자기소개</Text>
                  <View style={styles.introTextBox}>
                    <Text style={styles.introText}>
                      {String(profile?.introduction ?? '').trim()}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/profile/introduction')}
              >
                <View style={styles.actionCardContent}>
                  <Text style={styles.actionCardTitle}>나의 소개 등록하기</Text>
                  <Text style={styles.actionCardDesc}>
                    소개를 등록하면{'\n'}지원 수락 확률이 올라가요.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* 나의 리뷰 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.reviewTitleRow}>
                <Text style={styles.sectionTitle}>나의 리뷰</Text>
                <Text style={styles.reviewRating}>평점 {user.rating}</Text>
              </View>
              <TouchableOpacity
                style={styles.moreLink}
                onPress={() => router.push('/reviews')}
              >
                <Text style={styles.moreLinkText}>더보기</Text>
                <Ionicons name="chevron-forward" size={16} color="#37383C9C" />
              </TouchableOpacity>
            </View>

            {loadingMy ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>로딩 중…</Text>
              </View>
            ) : myError ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{String(myError)}</Text>
              </View>
            ) : reviewPreview.length > 0 ? (
              reviewPreview.map((review) => (
                <View key={String(review.id)} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewPatient}>리뷰</Text>
                    <View style={styles.reviewStars}>
                      {renderStars(Number(review.rating ?? 0))}
                    </View>
                  </View>
                  <Text style={styles.reviewPeriod}>
                    작성일 {String(review.createdAt || '').slice(0, 10)}
                  </Text>
                  <Text style={styles.reviewContent}>
                    {review.content && String(review.content).trim()
                      ? String(review.content)
                      : '내용 없음'}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>아직 작성된 리뷰가 없습니다.</Text>
              </View>
            )}
          </View>

          {/* 로그아웃 (세션만 초기화) */}
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* 간병일지 Tab Content */}
      {activeTab === '간병일지' && <CaregivingJournalHome />}

      {/* 수익 Tab Content */}
      {activeTab === '수익' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 이번달 총 수익 */}
          <View style={styles.earningHeader}>
            <Text style={styles.earningTitle}>이번달 총 수익</Text>
            <Text style={styles.earningTotal}>
              {Number(earnings.total || 0).toLocaleString()}원
            </Text>
            <Text style={styles.earningHint}>
              * 정산 확정 전, 완료된 매칭(일 단가 × 기간) 기반의 추정치입니다.
            </Text>
          </View>

          {/* 근무 요약 */}
          <View style={styles.earningSummaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>근무 일수</Text>
              <Text style={styles.summaryValue}>
                {Number(earnings.workDays || 0)}일
              </Text>
            </View>
            <View style={[styles.summaryRow, { marginBottom: 0 }]}>
              <Text style={styles.summaryLabel}>완료 매칭</Text>
              <Text style={styles.summaryValue}>{earnings.items.length}건</Text>
            </View>
          </View>

          {/* 출금 관련 */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Alert.alert('안내', '출금 계좌 설정 화면은 준비 중입니다.')}
          >
            <Text style={styles.linkText}>출금 계좌 설정</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Alert.alert('안내', '출금 내역 화면은 준비 중입니다.')}
          >
            <Text style={styles.linkText}>출금 내역</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.dividerWrapper}>
            <View style={styles.divider} />
          </View>

          {/* 수익 내역 */}
          <Text style={styles.earningListTitle}>수익 내역</Text>
          <View style={styles.earningListSection}>
            <View style={styles.earningMonthRow}>
              <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
              <View style={styles.monthCenter}>
                <Text style={styles.earningMonthText}>
                  {new Date().getFullYear()}년 {new Date().getMonth() + 1}월
                </Text>
                <Ionicons name="caret-down" size={14} color="#111827" />
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </View>

            {earnings.items.length > 0 ? (
              earnings.items.map((it) => (
                <View key={it.id} style={styles.earningCard}>
                  <View style={styles.earningCardTop}>
                    <Text style={styles.noticeText}>매칭 #{it.id}</Text>
                    <Text style={styles.periodText}>
                      {formatYmd(it.startDate)} ~ {formatYmd(it.endDate)}
                    </Text>
                  </View>

                  <View style={styles.earningCardBottom}>
                    <Text style={styles.patientText}>{it.patientName}</Text>
                    <Text style={styles.amountText}>
                      {Number(it.amount || 0).toLocaleString()} 원
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>이번달 수익 내역이 없습니다.</Text>
              </View>
            )}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#70737C14',
  },
  referralButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#0066FF0D',
  },
  referralText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  notificationButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#111827',
  },
  tabText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8C919634',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#171719',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2E2F33E0',
  },
  ratingValue: {
    fontSize: 16,
    color: '#2E2F33E0',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderColor: '#70737C29',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#171719',
  },
  profileDetails: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F7F7F8',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  moreLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37383C9C',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionCardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  reviewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewRating: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '500',
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#70737C38',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171719',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewPeriod: {
    fontSize: 14,
    color: '#2E2F33E0',
    marginBottom: 8,
  },
  reviewContent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E2F33E0',
    lineHeight: 20,
  },
  ongoingCareCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#70737C29',
    padding: 16,
  },
  daysRemaining: {
    fontSize: 14,
    color: '#0066FF',
    marginBottom: 8,
  },
  ongoingPatientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  ongoingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  ongoingTag: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#70737C29',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ongoingTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#37383C9C',
  },
  ongoingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  ongoingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ongoingDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ongoingDetailIcon: {
    width: 20,
    marginRight: 4,
  },
  ongoingDetailLabel: {
    fontSize: 15,
    color: '#2E2F33E0',
  },
  ongoingDetailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#171719',
  },
  ongoingButtons: {
    gap: 12,
  },
  writeJournalButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  writeJournalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  viewDetailButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#70737C29',
    alignItems: 'center',
  },
  viewDetailButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171719',
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderColor: '#70737C29',
    borderRadius: 8,
  },
  editLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#171719',
  },
  introductionCard: {
    borderWidth: 1,
    borderColor: '#70737C38',
    borderRadius: 10,
    padding: 20,
  },
  introSection: {
    marginBottom: 20,
  },
  introLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  introTextBox: {
    backgroundColor: '#F7F7F8',
    padding: 16,
    borderRadius: 12,
  },
  introText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#37383C9C',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#70737C29',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
  },
  // Caregiving Journal Tab Styles
  patientHeader: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0066FF',
    marginHorizontal: 20,
    marginVertical: 30,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  patientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  patientTag: {
    borderWidth: 1,
    borderColor: '#70737C29',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  patientTagText: {
    fontSize: 12,
    color: '#37383C9C',
    fontWeight: '500',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  dateArrow: {
    // padding: 8,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171719',
  },
  journalSection: {
    padding: 20,
  },
  journalSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  specialNotesSection: {
    padding: 20,
    paddingTop: 0,
  },
  specialNotesTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  specialNotesBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    minHeight: 100,
  },
  specialNotesInput: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 16,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },

  earningHeader: {
    padding: 20,
  },
  earningTitle: {
    fontSize: 14,
    color: '#2E2F33E0',
    marginBottom: 4,
  },
  earningTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#171719',
  },
  earningHint: {
    marginTop: 6,
    marginLeft: 20,
    marginRight: 20,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  earningSummaryCard: {
    backgroundColor: '#F7F7F8',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#37383C9C',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171719',
  },

  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#171719',
  },
  logoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.18)',
    backgroundColor: 'rgba(239,68,68,0.06)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  dividerWrapper: {
    marginTop: 20,
    marginBottom: 20,
    color: '#70737C38',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  earningListTitle: {
    paddingHorizontal: 20,
    fontSize: 17,
    fontWeight: '600',
    color: '#171719',
  },
  earningListSection: {
    padding: 20,
  },
  earningMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  monthCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  earningMonthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171719',
  },
  earningCard: {
    borderWidth: 1,
    borderColor: '#70737C29',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  earningCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 14,
    color: '#2E2F33E0',
  },
  periodText: {
    fontSize: 14,
    color: '#2E2F33E0',
  },
  earningCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#171719',
  },
  amountText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#0066FF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
  },
  referralWrapper: {
    marginBottom: 8,
  },

  referralBanner: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#0066FF1A',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  referralTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  referralTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0054D1',
  },

  referralCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0066FF',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    width: '100%',
  },

  referralCodeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
