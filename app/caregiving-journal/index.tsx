import api from '@/services/apiClient';
import { devlog, isDevtoolsEnabled } from '@/services/devlog';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MyMatch = {
  id: number;
  patientName: string;
  careType: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  dailyRate: number;
};

type CountNote = { count: number; tags?: string[]; note?: string };
type Status = 'caution' | 'normal' | 'good';

type MealRecord = {
  amount?: 'NONE' | 'LITTLE' | 'HALF' | 'FULL';
  menu?: string;
  notes?: string;
  status?: Status;
  mealType?: string;
  urination?: CountNote;
  bowelMovement?: CountNote;
  diaperUsage?: number;
  mobility?: string;
  careNotes?: string;
};

type MedicalRecord = { types?: string[]; otherNotes?: string };
type ActivityRecord = { exercise?: Status; sleep?: Status; otherNotes?: string };

type JournalListItem = { id: number; date: string };
type JournalDetail = {
  id: number;
  matchId: number;
  patientName: string;
  date: string;
  breakfast?: MealRecord;
  lunch?: MealRecord;
  dinner?: MealRecord;
  medicalRecord?: MedicalRecord;
  activityRecord?: ActivityRecord;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const DEVTOOLS_ENABLED = isDevtoolsEnabled();

function unwrapData<T>(resData: unknown): T {
  const anyRes = resData as any;
  if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
    return anyRes.data as T;
  }
  return anyRes as T;
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toDotYmd(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${m[1]}.${m[2]}.${m[3]}`;
}

function statusLabel(s: Status | undefined): string {
  if (s === 'caution') return '주의';
  if (s === 'normal') return '보통';
  if (s === 'good') return '양호';
  return '-';
}

export default function CaregivingJournalHome() {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{ matchId?: string; date?: string }>();
  const [appliedRouteParams, setAppliedRouteParams] = useState(false);

  const [loadingMatches, setLoadingMatches] = useState(true);
  const [matches, setMatches] = useState<MyMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(toYmd(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [journal, setJournal] = useState<JournalDetail | null>(null);

  const selectedMatch = useMemo(
    () => matches.find((m) => m.id === selectedMatchId) ?? null,
    [matches, selectedMatchId],
  );

  useEffect(() => {
    let alive = true;
    setLoadingMatches(true);
    setError(null);
    (async () => {
      try {
        const res = await api.get('/my/matches');
        const data = unwrapData<MyMatch[]>((res as any)?.data);
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        setMatches(list);
        if (DEVTOOLS_ENABLED) {
          devlog({
            scope: 'SYS',
            level: 'info',
            message: `matches loaded: count=${list.length}`,
            meta: { count: list.length, ids: list.slice(0, 5).map((m) => m.id) },
          });
        }
        setSelectedMatchId((prev) => {
          if (typeof prev === 'number') return prev;
          return list.length > 0 ? list[0].id : null;
        });
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message || e?.message || '매칭 목록 조회에 실패했습니다.',
        );
        setMatches([]);
        setSelectedMatchId(null);
        if (DEVTOOLS_ENABLED) {
          devlog({
            scope: 'SYS',
            level: 'warn',
            message: `matches load failed`,
            meta: { status: e?.response?.status, message: e?.response?.data?.message || e?.message },
          });
        }
      } finally {
        if (alive) setLoadingMatches(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const seedMatchFromFirstJob = useCallback(async () => {
    if (!DEVTOOLS_ENABLED) return;
    // ============================================
    // SEALED DEV LEVER (v0.1) — DO NOT SHIP TO STORE
    // ============================================
    // Purpose: 간병일지 테스트의 선행조건(matchId)을 "추측 없이" 즉시 확보하기 위한 DEV 전용 레버.
    // - jobs[0] 자동 지원 → my/matches 재조회 → 첫 matchId 선택
    // - DEV TRACE로 성공/실패를 즉시 관측
    try {
      devlog({ scope: 'SYS', level: 'info', message: 'seed match: start' });
      const res = await api.get('/jobs');
      const raw = (res as any)?.data;
      const jobs = unwrapData<any>(raw);
      const jobsList: any[] = Array.isArray(jobs)
        ? jobs
        : Array.isArray((jobs as any)?.items)
          ? (jobs as any).items
          : Array.isArray((jobs as any)?.results)
            ? (jobs as any).results
            : Array.isArray((jobs as any)?.data)
              ? (jobs as any).data
              : [];

      if (jobsList.length === 0) {
        devlog({
          scope: 'SYS',
          level: 'warn',
          message: 'seed match: no jobs (0)',
          meta: { jobsKeys: jobs && typeof jobs === 'object' ? Object.keys(jobs).slice(0, 30) : [] },
        });
        return;
      }

      const first =
        jobsList[0] && typeof jobsList[0] === 'object' ? (jobsList[0] as any) : null;
      const idRaw = first
        ? (first.id ??
          first.jobId ??
          first.requestId ??
          first.request_id ??
          first.careRequestId ??
          first.care_request_id)
        : null;
      const jobId = typeof idRaw === 'string' ? idRaw.trim() : idRaw != null ? String(idRaw) : '';
      if (!jobId) {
        devlog({
          scope: 'SYS',
          level: 'warn',
          message: 'seed match: no job id (missing id field)',
          meta: {
            shape: typeof jobs,
            listCount: jobsList.length,
            firstKeys: first ? Object.keys(first).slice(0, 20) : [],
            idCandidates: first
              ? {
                  id: first.id,
                  jobId: first.jobId,
                  requestId: first.requestId,
                  request_id: first.request_id,
                  careRequestId: first.careRequestId,
                  care_request_id: first.care_request_id,
                }
              : {},
          },
        });
        return;
      }

      devlog({ scope: 'SYS', level: 'info', message: `seed match: apply jobId=${jobId}` });
      // Backend accepts optional body; send stable shape to avoid 400 on strict validators.
      await api.post(`/jobs/${encodeURIComponent(jobId)}/apply`, { message: null });
      devlog({ scope: 'SYS', level: 'info', message: 'seed match: apply ok' });
      // Reload matches
      setLoadingMatches(true);
      const mres = await api.get('/my/matches');
      const data = unwrapData<MyMatch[]>((mres as any)?.data);
      const matchesList = Array.isArray(data) ? data : [];
      setMatches(matchesList);
      setSelectedMatchId(matchesList.length > 0 ? matchesList[0].id : null);
      devlog({
        scope: 'SYS',
        level: 'info',
        message: `seed match: matches count=${matchesList.length}`,
        meta: { count: matchesList.length, ids: matchesList.slice(0, 5).map((m) => m.id) },
      });
    } catch (e: any) {
      devlog({
        scope: 'SYS',
        level: 'error',
        message: 'seed match: failed',
        meta: { status: e?.response?.status, message: e?.response?.data?.message || e?.message },
      });
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  const seedMatchByCreatingRequest = useCallback(async () => {
    if (!DEVTOOLS_ENABLED) return;
    // ============================================
    // SEALED DEV LEVER (v0.1) — DO NOT SHIP TO STORE
    // ============================================
    // Purpose: /jobs 가 비어있는 DEV 환경에서 T7 선행조건(matchId)을 확정적으로 생성.
    // Flow: POST /patients -> POST /care-requests -> POST /jobs/:id/apply -> GET /my/matches
    try {
      devlog({ scope: 'SYS', level: 'info', message: 'seed match(v2): start' });

      // 1) Create patient (minimal required fields)
      const now = new Date();
      const birth = '1950-01-15';
      const patientRes = await api.post('/patients', {
        name: `DEV 환자`,
        birthDate: birth,
        gender: 'MALE',
        mobilityLevel: 'PARTIAL_ASSIST',
        diagnosis: 'DEV',
        notes: 'DEV seed',
      });
      const patient = unwrapData<any>((patientRes as any)?.data);
      const patientId = typeof patient?.id === 'string' ? patient.id : String(patient?.id || '');
      if (!patientId) {
        devlog({ scope: 'SYS', level: 'error', message: 'seed match(v2): patient id missing' });
        return;
      }
      devlog({ scope: 'SYS', level: 'info', message: `seed match(v2): patientId=${patientId}` });

      // 2) Create care request (job)
      const start = new Date(now.getTime() + 30 * 60 * 1000);
      const end = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      const reqRes = await api.post('/care-requests', {
        patientId,
        careType: 'HOSPITAL',
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        location: 'DEV 병원',
        requirements: 'DEV seed',
        dailyRate: 150000,
        preferredCaregiverGender: undefined,
      });
      const req = unwrapData<any>((reqRes as any)?.data);
      const jobId = typeof req?.id === 'string' ? req.id : String(req?.id || '');
      if (!jobId) {
        devlog({ scope: 'SYS', level: 'error', message: 'seed match(v2): job id missing' });
        return;
      }
      devlog({ scope: 'SYS', level: 'info', message: `seed match(v2): jobId=${jobId}` });

      // 3) Apply (creates match immediately in MVP backend)
      await api.post(`/jobs/${encodeURIComponent(jobId)}/apply`, { message: null });
      devlog({ scope: 'SYS', level: 'info', message: 'seed match(v2): apply ok' });

      // 4) Reload matches
      setLoadingMatches(true);
      const mres = await api.get('/my/matches');
      const data = unwrapData<MyMatch[]>((mres as any)?.data);
      const matchesList = Array.isArray(data) ? data : [];
      setMatches(matchesList);
      setSelectedMatchId(matchesList.length > 0 ? matchesList[0].id : null);
      devlog({
        scope: 'SYS',
        level: 'info',
        message: `seed match(v2): matches count=${matchesList.length}`,
        meta: { count: matchesList.length, ids: matchesList.slice(0, 5).map((m) => m.id) },
      });
    } catch (e: any) {
      devlog({
        scope: 'SYS',
        level: 'error',
        message: 'seed match(v2): failed',
        meta: { status: e?.response?.status, message: e?.response?.data?.message || e?.message },
      });
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  const seedLockedJournal409 = useCallback(async () => {
    if (!DEVTOOLS_ENABLED) return;
    // ============================================
    // SEALED DEV LEVER (v0.1) — DO NOT SHIP TO STORE
    // ============================================
    // Purpose: T8-4-2 증거 확보용 (endDate 이후 409 수정/작성 락).
    // Flow: POST /patients -> POST /care-requests(endDate in past) -> POST /jobs/:id/apply -> POST /journals (expect 409)
    try {
      devlog({ scope: 'SYS', level: 'info', message: 'seed lock(409): start' });

      const now = Date.now();
      const start = new Date(now - 3 * 60 * 60 * 1000);
      const end = new Date(now - 60 * 1000);
      const today = toYmd(new Date());

      const patientRes = await api.post('/patients', {
        name: `DEV 종료환자`,
        birthDate: '1950-01-15',
        gender: 'MALE',
        mobilityLevel: 'PARTIAL_ASSIST',
        diagnosis: 'DEV-LOCK',
        notes: 'DEV lock seed',
      });
      const patient = unwrapData<any>((patientRes as any)?.data);
      const patientId = typeof patient?.id === 'string' ? patient.id : String(patient?.id || '');
      if (!patientId) {
        devlog({ scope: 'SYS', level: 'error', message: 'seed lock(409): patient id missing' });
        return;
      }

      const reqRes = await api.post('/care-requests', {
        patientId,
        careType: 'HOSPITAL',
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        location: 'DEV 종료 병원',
        requirements: 'DEV lock seed',
        dailyRate: 150000,
      });
      const req = unwrapData<any>((reqRes as any)?.data);
      const jobId = typeof req?.id === 'string' ? req.id : String(req?.id || '');
      if (!jobId) {
        devlog({ scope: 'SYS', level: 'error', message: 'seed lock(409): job id missing' });
        return;
      }
      devlog({ scope: 'SYS', level: 'info', message: `seed lock(409): jobId=${jobId}` });

      await api.post(`/jobs/${encodeURIComponent(jobId)}/apply`, { message: 'DEV lock test' });
      devlog({ scope: 'SYS', level: 'info', message: 'seed lock(409): apply ok' });

      // Reload matches so user can see the locked match too.
      setLoadingMatches(true);
      const mres = await api.get('/my/matches');
      const data = unwrapData<MyMatch[]>((mres as any)?.data);
      const matchesList = Array.isArray(data) ? data : [];
      setMatches(matchesList);
      if (matchesList.length > 0) setSelectedMatchId(matchesList[0].id);
      setSelectedDate(today);

      // Attempt to create a journal; backend must return 409 due to endDate lock.
      try {
        await api.post('/journals', { matchId: matchesList[0]?.id, date: today, notes: 'DEV lock test' });
        devlog({ scope: 'SYS', level: 'warn', message: 'seed lock(409): unexpected success' });
      } catch (e: any) {
        devlog({
          scope: 'SYS',
          level: 'info',
          message: 'seed lock(409): expected',
          meta: { status: e?.response?.status, message: e?.response?.data?.message || e?.message },
        });
      }
    } catch (e: any) {
      devlog({
        scope: 'SYS',
        level: 'error',
        message: 'seed lock(409): failed',
        meta: { status: e?.response?.status, message: e?.response?.data?.message || e?.message },
      });
    } finally {
      setLoadingMatches(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (appliedRouteParams) return;
    if (loadingMatches) return;

    const rawMatchId = routeParams.matchId;
    const rawDate = routeParams.date;

    const next: { matchId?: number; date?: string } = {};

    if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      next.date = rawDate;
    }

    if (typeof rawMatchId === 'string') {
      const n = Number(rawMatchId);
      if (Number.isFinite(n) && matches.some((m) => m.id === n)) {
        next.matchId = n;
      }
    }

    if (next.date) setSelectedDate(next.date);
    if (typeof next.matchId === 'number') setSelectedMatchId(next.matchId);
    setAppliedRouteParams(true);
  }, [appliedRouteParams, loadingMatches, matches, routeParams.date, routeParams.matchId]);

  const loadJournalForDate = useCallback(async () => {
    if (!selectedMatchId) {
      setJournal(null);
      return;
    }
    setLoading(true);
    setError(null);
    setJournal(null);
    try {
      const res = await api.get('/journals', {
        params: { matchId: selectedMatchId },
      });
      const list = unwrapData<JournalListItem[]>((res as any)?.data);
      const found = Array.isArray(list)
        ? list.find((r) => r.date === selectedDate)
        : undefined;
      if (!found) {
        setJournal(null);
        return;
      }

      const detailRes = await api.get(`/journals/${found.id}`);
      const detail = unwrapData<JournalDetail>((detailRes as any)?.data);
      setJournal(detail ?? null);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || '일지 조회에 실패했습니다.',
      );
      setJournal(null);
    } finally {
      setLoading(false);
    }
  }, [selectedMatchId, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      void loadJournalForDate();
    }, [loadJournalForDate]),
  );
  // NOTE: `useFocusEffect` already runs on initial focus and when dependencies change (while focused).
  // Keeping a second `useEffect` here causes duplicate API calls on first mount.

  const shiftDate = (deltaDays: number) => {
    const d = new Date(`${selectedDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) return;
    d.setDate(d.getDate() + deltaDays);
    setSelectedDate(toYmd(d));
  };

  const MatchChip = ({ m }: { m: MyMatch }) => {
    const active = m.id === selectedMatchId;
    return (
      <Pressable
        onPress={() => setSelectedMatchId(m.id)}
        style={[styles.matchChip, active && styles.matchChipActive]}
      >
        <Text style={[styles.matchChipTitle, active && styles.matchChipTitleActive]}>
          {m.patientName || '환자'} · #{m.id}
        </Text>
      </Pressable>
    );
  };

  const SummaryRow = ({
    label,
    value,
    danger,
  }: {
    label: string;
    value: string;
    danger?: boolean;
  }) => (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        style={[styles.summaryValue, danger && styles.summaryValueDanger]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );

  const MealCard = ({
    title,
    timeRange,
    keyName,
    v,
  }: {
    title: string;
    timeRange: string;
    keyName: 'morning' | 'lunch' | 'dinner';
    v: MealRecord | undefined;
  }) => {
    const has =
      !!v &&
      (!!v.mealType ||
        !!v.status ||
        !!v.urination ||
        !!v.bowelMovement ||
        !!v.careNotes);

    const status = v?.status;
    const urination = v?.urination;
    const bowel = v?.bowelMovement;

    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          if (!selectedMatchId) return;
          router.push(
            `/caregiving-journal/meal-record?matchId=${String(
              selectedMatchId,
            )}&date=${encodeURIComponent(selectedDate)}&time=${keyName}`,
          );
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {title} ({timeRange})
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>

        {has ? (
          <View style={{ marginTop: 10, gap: 6 }}>
            <SummaryRow
              label="상태"
              value={statusLabel(status)}
              danger={status === 'caution'}
            />
            <SummaryRow label="식사" value={v?.mealType || '-'} />
            <SummaryRow
              label="소변"
              value={
                urination
                  ? `${urination.count}회${
                      urination.note ? `/${urination.note}` : ''
                    }`
                  : '-'
              }
            />
            <SummaryRow
              label="대변량"
              value={
                bowel ? `${bowel.count}회${bowel.note ? `/${bowel.note}` : ''}` : '-'
              }
            />
            <SummaryRow
              label="기저귀 사용량"
              value={typeof v?.diaperUsage === 'number' ? `${v.diaperUsage}회` : '-'}
            />
            <SummaryRow label="이동" value={v?.mobility || '-'} />
            <SummaryRow label="특이사항" value={v?.careNotes || '-'} />
          </View>
        ) : (
          <Text style={styles.cardEmptyText}>일지를 작성해주세요.</Text>
        )}
      </Pressable>
    );
  };

  const MedicalCard = ({ v }: { v: MedicalRecord | undefined }) => {
    const types = v?.types ?? [];
    const other = v?.otherNotes ?? '';
    const has = (Array.isArray(types) && types.length > 0) || other.trim().length > 0;
    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          if (!selectedMatchId) return;
          router.push(
            `/caregiving-journal/medical-record?matchId=${String(
              selectedMatchId,
            )}&date=${encodeURIComponent(selectedDate)}`,
          );
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>의료기록</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>

        {has ? (
          <View style={{ marginTop: 10, gap: 10 }}>
            {types.length > 0 && (
              <View style={styles.chipRow}>
                {types.slice(0, 4).map((t) => (
                  <View key={t} style={styles.chip}>
                    <Text style={styles.chipText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.medicalNote} numberOfLines={2}>
              {other.trim() ? other.trim() : '특이 및 전달 사항'}
            </Text>
          </View>
        ) : (
          <Text style={styles.cardEmptyText}>의료기록을 선택해주세요.</Text>
        )}
      </Pressable>
    );
  };

  const ActivityCard = ({ v }: { v: ActivityRecord | undefined }) => {
    const ex = v?.exercise;
    const sl = v?.sleep;
    const has = !!ex || !!sl;
    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          if (!selectedMatchId) return;
          router.push(
            `/caregiving-journal/activity-record?matchId=${String(
              selectedMatchId,
            )}&date=${encodeURIComponent(selectedDate)}`,
          );
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>활동기록</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
        {has ? (
          <View style={{ marginTop: 10, gap: 8 }}>
            <SummaryRow label="운동" value={statusLabel(ex)} danger={ex === 'caution'} />
            <SummaryRow label="수면" value={statusLabel(sl)} danger={sl === 'caution'} />
          </View>
        ) : (
          <Text style={styles.cardEmptyText}>활동기록을 선택해주세요.</Text>
        )}
      </Pressable>
    );
  };

  const NotesCard = ({ v }: { v: string | undefined }) => {
    const has = !!v && v.trim().length > 0;
    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          if (!selectedMatchId) return;
          router.push(
            `/caregiving-journal/new?matchId=${String(
              selectedMatchId,
            )}&date=${encodeURIComponent(selectedDate)}`,
          );
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>특이사항</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
        {has ? (
          <Text style={styles.medicalNote} numberOfLines={3}>
            {v!.trim()}
          </Text>
        ) : (
          <Text style={styles.cardEmptyText}>특이사항을 작성해주세요.</Text>
        )}
      </Pressable>
    );
  };

  if (loadingMatches) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>간병일지</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{String(error)}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>환자 선택</Text>
          {matches.length > 0 ? (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.matchRow}>
                  {matches.map((m) => (
                    <MatchChip key={m.id} m={m} />
                  ))}
                </View>
              </ScrollView>
              {DEVTOOLS_ENABLED && (
                <View style={{ marginTop: 10, gap: 10 }}>
                  <Pressable onPress={seedLockedJournal409} style={styles.ctaBtn}>
                    <Text style={styles.ctaBtnText}>DEV: 종료(409) 테스트 자동 생성</Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                아직 매칭이 없습니다. 공고에 지원하면 매칭이 생성되고 일지를 작성할 수 있습니다.
              </Text>
              <Pressable
                onPress={() => router.replace('/(tabs)')}
                style={[styles.ctaBtn, styles.ctaBtnGhost]}
              >
                <Text style={styles.ctaBtnGhostText}>홈(공고)로 이동</Text>
              </Pressable>
              {DEVTOOLS_ENABLED && (
                <>
                  <Pressable onPress={seedMatchFromFirstJob} style={styles.ctaBtn}>
                    <Text style={styles.ctaBtnText}>DEV: 첫 공고 자동 지원(매칭 생성)</Text>
                  </Pressable>
                  <Pressable onPress={seedMatchByCreatingRequest} style={styles.ctaBtn}>
                    <Text style={styles.ctaBtnText}>DEV: 환자+공고+매칭 자동 생성</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.dateRow}>
          <Pressable onPress={() => shiftDate(-1)} style={styles.dateNavBtn}>
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </Pressable>
          <View style={styles.dateCenter}>
            <Text style={styles.dateText}>{toDotYmd(selectedDate)}</Text>
            <Ionicons name="chevron-down" size={14} color="#6B7280" />
          </View>
          <Pressable onPress={() => shiftDate(1)} style={styles.dateNavBtn}>
            <Ionicons name="chevron-forward" size={20} color="#111827" />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>오늘의 일지</Text>

        {loading ? (
          <View style={styles.centerSmall}>
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        ) : !selectedMatch ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>매칭(환자)을 선택해 주세요.</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <MealCard
              title="아침"
              timeRange="06:00 ~ 11:00"
              keyName="morning"
              v={journal?.breakfast}
            />
            <MealCard
              title="점심"
              timeRange="11:00 ~ 15:00"
              keyName="lunch"
              v={journal?.lunch}
            />
            <MealCard
              title="저녁"
              timeRange="15:00 ~ 20:00"
              keyName="dinner"
              v={journal?.dinner}
            />
            <MedicalCard v={journal?.medicalRecord} />
            <ActivityCard v={journal?.activityRecord} />
            <NotesCard v={journal?.notes} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerSmall: { paddingVertical: 16, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 12 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  ctaBtn: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  ctaBtnGhost: {
    backgroundColor: 'rgba(37,99,235,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.25)',
  },
  ctaBtnGhostText: { color: '#1D4ED8', fontWeight: '800', fontSize: 13 },

  matchRow: { flexDirection: 'row', gap: 10, paddingRight: 10 },
  matchChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    minWidth: 140,
  },
  matchChipActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  matchChipTitle: { fontWeight: '800', color: '#111827' },
  matchChipTitleActive: { color: '#1D4ED8' },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 16,
  },
  dateNavBtn: { padding: 8 },
  dateCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 18, fontWeight: '800', color: '#111827' },

  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  cardEmptyText: { marginTop: 10, color: '#6B7280' },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: { color: '#6B7280', fontWeight: '600' },
  summaryValue: { color: '#111827', fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  summaryValueDanger: { color: '#EF4444' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: { color: '#2563EB', fontWeight: '700', fontSize: 12 },
  medicalNote: { color: '#111827', lineHeight: 18 },

  emptyBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#F9FAFB',
  },
  emptyText: { color: '#6B7280', lineHeight: 18 },
  errorBox: {
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: '#B91C1C' },
});


