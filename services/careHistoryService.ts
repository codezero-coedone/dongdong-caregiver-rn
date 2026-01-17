import { apiClient } from './apiClient';

export type ApiMyMatch = {
  id: number;
  patientName: string;
  patientBirthDate?: string;
  patientGender?: string;
  patientAge?: number;
  patientHeight?: number;
  patientWeight?: number;
  patientDiagnosis?: string;
  patientMobilityLevel?: string;
  patientAssistiveDevices?: string[];
  careType: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  dailyRate: number;
};

function unwrapData<T>(resData: unknown): T {
  const anyRes = resData as any;
  if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
    return anyRes.data as T;
  }
  return anyRes as T;
}

export async function fetchMyMatches(): Promise<ApiMyMatch[]> {
  const res = await apiClient.get('/my/matches');
  const data = unwrapData<ApiMyMatch[]>((res as any)?.data);
  return Array.isArray(data) ? data : [];
}

