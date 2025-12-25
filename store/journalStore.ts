import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 식사 기록 타입
export interface MealRecord {
  status: 'caution' | 'good'; // 주의 / 양호
  mealType: string; // 유동식, 일반식 등
  urination: {
    count: number;
    note?: string;
  };
  bowelMovement: {
    count: number;
    note?: string;
  };
  diaperUsage?: number;
  mobility?: string; // 보행도움, 휠체어 등
  careNotes?: string; // 돌봄 특이사항
}

// 의료 기록 타입
export interface MedicalRecord {
  types: string[]; // 선택된 의료 기록 항목들
  otherNotes?: string; // 기타 사항
}

// 활동 기록 타입
export type ActivityStatus = 'caution' | 'normal' | 'good';
export interface ActivityRecord {
  exercise: ActivityStatus;
  sleep: ActivityStatus;
  otherNotes?: string;
}

// 일지 항목 타입
export interface JournalEntry {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  morning?: MealRecord;
  lunch?: MealRecord;
  dinner?: MealRecord;
  medicalRecord?: MedicalRecord;
  activityRecord?: ActivityRecord;
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock 환자 데이터
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: '남' | '여';
  tags: string[];
}

interface JournalState {
  entries: JournalEntry[];
  currentPatient: Patient | null;
  selectedDate: string; // YYYY-MM-DD

  // Actions
  setSelectedDate: (date: string) => void;
  setCurrentPatient: (patient: Patient | null) => void;
  getEntryByDate: (date: string, patientId: string) => JournalEntry | undefined;
  saveMealRecord: (
    date: string,
    patientId: string,
    mealTime: 'morning' | 'lunch' | 'dinner',
    record: MealRecord,
  ) => void;
  saveMedicalRecord: (
    date: string,
    patientId: string,
    record: MedicalRecord,
  ) => void;
  saveActivityRecord: (
    date: string,
    patientId: string,
    record: ActivityRecord,
  ) => void;
  saveSpecialNotes: (date: string, patientId: string, notes: string) => void;
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
const getTodayString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(today.getDate()).padStart(2, '0')}`;
};

// Mock 환자 데이터
export const MOCK_PATIENT: Patient = {
  id: 'patient-1',
  name: '이환자',
  age: 68,
  gender: '남',
  tags: ['폐암 3기', '입원치료 중', '부분 도움'],
};

// Mock 일지 데이터
const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    patientId: 'patient-1',
    date: '2025-11-15',

    morning: {
      status: 'caution',
      mealType: '유동식',
      urination: { count: 1, note: '양이 평소보다 적음' },
      bowelMovement: { count: 1, note: '설사' },
      diaperUsage: 2,
      mobility: '보행도움',
      careNotes: '딤담의 회진',
    },

    lunch: undefined,
    dinner: undefined,

    medicalRecord: {
      types: ['주사', '약 복용'],
      otherNotes: undefined,
    },

    activityRecord: {
      exercise: 'caution',
      sleep: 'caution',
      otherNotes: undefined,
    },

    specialNotes: '37.8도로 매일 해열제 추가 필요',
    createdAt: '2025-11-15T09:00:00Z',
    updatedAt: '2025-11-15T18:00:00Z',
  },
];

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: MOCK_ENTRIES,
      currentPatient: MOCK_PATIENT,
      selectedDate: getTodayString(),

      setSelectedDate: (date) => set({ selectedDate: date }),

      setCurrentPatient: (patient) => set({ currentPatient: patient }),

      getEntryByDate: (date, patientId) => {
        return get().entries.find(
          (entry) => entry.date === date && entry.patientId === patientId,
        );
      },

      saveMealRecord: (date, patientId, mealTime, record) => {
        set((state) => {
          const existingEntryIndex = state.entries.findIndex(
            (e) => e.date === date && e.patientId === patientId,
          );

          if (existingEntryIndex >= 0) {
            const updatedEntries = [...state.entries];
            updatedEntries[existingEntryIndex] = {
              ...updatedEntries[existingEntryIndex],
              [mealTime]: record,
              updatedAt: new Date().toISOString(),
            };
            return { entries: updatedEntries };
          } else {
            const newEntry: JournalEntry = {
              id: `entry-${Date.now()}`,
              patientId,
              date,
              [mealTime]: record,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            return { entries: [...state.entries, newEntry] };
          }
        });
      },

      saveMedicalRecord: (date, patientId, record) => {
        set((state) => {
          const existingEntryIndex = state.entries.findIndex(
            (e) => e.date === date && e.patientId === patientId,
          );

          if (existingEntryIndex >= 0) {
            const updatedEntries = [...state.entries];
            updatedEntries[existingEntryIndex] = {
              ...updatedEntries[existingEntryIndex],
              medicalRecord: record,
              updatedAt: new Date().toISOString(),
            };
            return { entries: updatedEntries };
          } else {
            const newEntry: JournalEntry = {
              id: `entry-${Date.now()}`,
              patientId,
              date,
              medicalRecord: record,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            return { entries: [...state.entries, newEntry] };
          }
        });
      },

      saveActivityRecord: (date, patientId, record) => {
        set((state) => {
          const existingEntryIndex = state.entries.findIndex(
            (e) => e.date === date && e.patientId === patientId,
          );

          if (existingEntryIndex >= 0) {
            const updatedEntries = [...state.entries];
            updatedEntries[existingEntryIndex] = {
              ...updatedEntries[existingEntryIndex],
              activityRecord: record,
              updatedAt: new Date().toISOString(),
            };
            return { entries: updatedEntries };
          } else {
            const newEntry: JournalEntry = {
              id: `entry-${Date.now()}`,
              patientId,
              date,
              activityRecord: record,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            return { entries: [...state.entries, newEntry] };
          }
        });
      },

      saveSpecialNotes: (date, patientId, notes) => {
        set((state) => {
          const existingEntryIndex = state.entries.findIndex(
            (e) => e.date === date && e.patientId === patientId,
          );

          if (existingEntryIndex >= 0) {
            const updatedEntries = [...state.entries];
            updatedEntries[existingEntryIndex] = {
              ...updatedEntries[existingEntryIndex],
              specialNotes: notes,
              updatedAt: new Date().toISOString(),
            };
            return { entries: updatedEntries };
          } else {
            const newEntry: JournalEntry = {
              id: `entry-${Date.now()}`,
              patientId,
              date,
              specialNotes: notes,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            return { entries: [...state.entries, newEntry] };
          }
        });
      },
    }),
    {
      name: 'dongdong-journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
