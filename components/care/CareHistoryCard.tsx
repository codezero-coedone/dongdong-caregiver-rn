import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface CareRecord {
  id: string;
  jobNumber?: string;
  patient: {
    name: string;
    age: number;
    gender: string;
  };
  tags: string[];
  period: string;
  address?: string;
  diagnosis?: string;
  status: 'ongoing' | 'completed';
  daysRemaining?: number;
}

interface CareHistoryCardProps {
  record: CareRecord;
  onDetailPress?: () => void;
  onWriteJournalPress?: () => void;
  variant?: 'ongoing' | 'history';
}

export default function CareHistoryCard({
  record,
  onDetailPress,
  onWriteJournalPress,
  variant = 'history',
}: CareHistoryCardProps) {
  const isOngoing = variant === 'ongoing';

  return (
    <View style={styles.wrapper}>
      {/* 카드 본문 */}
      <View style={[styles.card, isOngoing && styles.cardOngoing]}>
        {/* 남은 일수 (진행 중만) */}
        {isOngoing && record.daysRemaining && (
          <Text style={styles.daysRemaining}>
            {record.daysRemaining}일 남음
          </Text>
        )}

        {/* 공고번호 (과거 내역만) */}
        {!isOngoing && record.jobNumber && (
          <Text style={styles.jobNumber}>공고번호 {record.jobNumber}</Text>
        )}

        {/* 환자 정보 */}
        <Text style={styles.patientName}>
          {record.patient.name} ({record.patient.age}세, {record.patient.gender}
          )
        </Text>

        {/* 태그 */}
        <View style={styles.tagsContainer}>
          {record.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* 상세 정보 */}
        <View style={styles.detailsContainer}>
          {isOngoing ? (
            <>
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.detailLabel}>기간</Text>
                </View>
                <Text style={styles.detailValue}>{record.period}</Text>
              </View>

              {record.diagnosis && (
                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons
                      name="medical-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.detailLabel}>병명</Text>
                  </View>
                  <Text style={styles.detailValue}>{record.diagnosis}</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.periodText}>{record.period}</Text>
              {record.address && (
                <Text style={styles.addressText}>{record.address}</Text>
              )}
            </>
          )}
        </View>

        {!isOngoing && (
          <TouchableOpacity style={styles.detailButton} onPress={onDetailPress}>
            <Text style={styles.detailButtonText}>상세보기</Text>
          </TouchableOpacity>
        )}
      </View>

      {isOngoing && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onWriteJournalPress}
        >
          <Text style={styles.primaryButtonText}>일지 작성하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#70737C29',
  },
  cardOngoing: {
    borderColor: '#3B82F6',
  },
  daysRemaining: {
    fontSize: 14,
    color: '#0066FF',
    marginBottom: 8,
  },
  jobNumber: {
    fontSize: 14,
    color: '#2E2F33E0',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#70737C29',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#37383C9C',
  },
  detailsContainer: {
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: '#2E2F33E0',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#171719',
  },
  periodText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2E2F33E0',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2E2F33E0',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  detailButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#70737C29',
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171719',
  },
});
