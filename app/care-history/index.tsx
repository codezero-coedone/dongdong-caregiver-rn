import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CareHistoryCard, { CareRecord } from '../../components/care/CareHistoryCard';

// Mock 진행 중인 간병 데이터
const MOCK_ONGOING_CARE: CareRecord = {
    id: 'ongoing-1',
    patient: {
        name: '이환자',
        age: 68,
        gender: '남',
    },
    tags: ['매칭 3기', '식사 가능', '배변 도움 필요'],
    period: '2025.11.15~11.30',
    diagnosis: '폐렴 및 심압',
    status: 'ongoing',
    daysRemaining: 15,
};

// Mock 과거 간병 내역 데이터
const MOCK_PAST_CARE: CareRecord[] = [
    {
        id: '1',
        jobNumber: '12345',
        patient: { name: '이환자', age: 68, gender: '남' },
        tags: ['매칭 3기', '식사 가능', '배변 도움 필요'],
        period: '2025.11.15 ~11.30',
        address: '서울특별시 강남구 대치동 남원빌라 3동 4',
        status: 'completed',
    },
    {
        id: '2',
        jobNumber: '12345',
        patient: { name: '이환자', age: 68, gender: '남' },
        tags: ['매칭 3기', '식사 가능', '배변 도움 필요'],
        period: '2025.11.15 ~11.30',
        address: '서울특별시 강남구 대치동 남원빌라 3동 4',
        status: 'completed',
    },
    {
        id: '3',
        jobNumber: '12345',
        patient: { name: '이환자', age: 68, gender: '남' },
        tags: ['매칭 3기', '식사 가능', '배변 도움 필요'],
        period: '2025.11.15 ~11.30',
        address: '서울특별시 강남구 대치동 남원빌라 3동 4',
        status: 'completed',
    },
    {
        id: '4',
        jobNumber: '12345',
        patient: { name: '이환자', age: 68, gender: '남' },
        tags: ['매칭 3기', '식사 가능', '배변 도움 필요'],
        period: '2025.11.15 ~11.30',
        address: '서울특별시 강남구 대치동 남원빌라 3동 4',
        status: 'completed',
    },
];

export default function CareHistoryScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecords = MOCK_PAST_CARE.filter(record => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            record.patient.name.toLowerCase().includes(query) ||
            record.jobNumber?.toLowerCase().includes(query)
        );
    });

    const handleDetailPress = (record: CareRecord) => {
        console.log('Detail pressed:', record.id);
        router.push('/care-history/detail?type=completed');
    };

    const handleWriteJournalPress = () => {
        console.log('Write journal pressed');
        // TODO: Navigate to journal writing screen
    };

    const handleViewOngoingDetail = () => {
        console.log('View ongoing detail');
        router.push('/care-history/detail');
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* 진행 중인 간병 섹션 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>진행 중인 간병</Text>
                        <TouchableOpacity
                            style={styles.detailLink}
                            onPress={handleViewOngoingDetail}
                        >
                            <Text style={styles.detailLinkText}>상세보기</Text>
                            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>

                    <CareHistoryCard
                        record={MOCK_ONGOING_CARE}
                        variant="ongoing"
                        onWriteJournalPress={handleWriteJournalPress}
                    />
                </View>

                {/* 과거 간병 내역 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>과거 간병 내역</Text>

                    {/* 검색 입력창 */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={18} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="환자명 혹은 공고번호 검색하기"
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* 총 건수 */}
                    <Text style={styles.totalCount}>총 {filteredRecords.length}건</Text>

                    {/* 간병 카드 리스트 */}
                    {filteredRecords.map(record => (
                        <CareHistoryCard
                            key={record.id}
                            record={record}
                            variant="history"
                            onDetailPress={() => handleDetailPress(record)}
                        />
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
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
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    detailLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailLinkText: {
        fontSize: 13,
        color: '#3B82F6',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#111827',
    },
    totalCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
});
