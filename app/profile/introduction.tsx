import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';

// 나만의 강점 옵션 (최대 3개)
const STRENGTH_OPTIONS = [
    '친절함', '책임감', '위생적인', '안전제일',
    '적극적', '인내심', '자상함', '믿음직', '세심함',
];

// 자신 있는 돌봄 옵션 (최대 5개)
const CARE_SKILL_OPTIONS = [
    '골절', '재활치료', '치매', '섬망',
    '파킨슨', '욕창', '외상 환자', '석션',
    '피딩', '소변줄', '장루', '기저귀 케어',
    '투석', '좌우 편마비', '하반신 마비',
    '전신 마비', '전염성 질환', '정신 질환',
    '자가 보행', '부축',
];

const MAX_INTRO_LENGTH = 200;
const MAX_STRENGTHS = 3;
const MAX_CARE_SKILLS = 5;

export default function IntroductionEditScreen() {
    const router = useRouter();

    // Form state
    const [introduction, setIntroduction] = useState('');
    const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
    const [selectedCareSkills, setSelectedCareSkills] = useState<string[]>([]);

    const handleIntroductionChange = (text: string) => {
        if (text.length <= MAX_INTRO_LENGTH) {
            setIntroduction(text);
        }
    };

    const toggleStrength = (strength: string) => {
        setSelectedStrengths(prev => {
            if (prev.includes(strength)) {
                return prev.filter(s => s !== strength);
            }
            if (prev.length >= MAX_STRENGTHS) {
                Alert.alert('알림', `나만의 강점은 최대 ${MAX_STRENGTHS}개까지 선택 가능합니다.`);
                return prev;
            }
            return [...prev, strength];
        });
    };

    const toggleCareSkill = (skill: string) => {
        setSelectedCareSkills(prev => {
            if (prev.includes(skill)) {
                return prev.filter(s => s !== skill);
            }
            if (prev.length >= MAX_CARE_SKILLS) {
                Alert.alert('알림', `자신 있는 돌봄은 최대 ${MAX_CARE_SKILLS}개까지 선택 가능합니다.`);
                return prev;
            }
            return [...prev, skill];
        });
    };

    const handleSubmit = () => {
        console.log('Introduction saved:', {
            introduction,
            strengths: selectedStrengths,
            careSkills: selectedCareSkills,
        });

        Alert.alert('완료', '자기소개가 등록되었습니다.', [
            { text: '확인', onPress: () => router.back() }
        ]);
    };

    const isFormValid = introduction.length > 0 || selectedStrengths.length > 0 || selectedCareSkills.length > 0;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* 자기소개 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Text style={styles.sectionIcon}>✏️</Text> 자기소개
                    </Text>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="나를 표현할 소개를 작성해주세요."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            value={introduction}
                            onChangeText={handleIntroductionChange}
                            maxLength={MAX_INTRO_LENGTH}
                        />
                        <View style={styles.textInputFooter}>
                            <Text style={styles.charCount}>
                                {introduction.length}/{MAX_INTRO_LENGTH}
                            </Text>
                            <TouchableOpacity>
                                <Text style={styles.inputButton}>입력</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 나만의 강점 섹션 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            <Text style={styles.sectionIcon}>💪</Text> 나만의 강점
                        </Text>
                        <Text style={styles.selectionCount}>
                            {selectedStrengths.length}/{MAX_STRENGTHS}
                        </Text>
                    </View>
                    <View style={styles.tagsContainer}>
                        {STRENGTH_OPTIONS.map((strength) => {
                            const isSelected = selectedStrengths.includes(strength);
                            return (
                                <TouchableOpacity
                                    key={strength}
                                    style={[styles.tag, isSelected && styles.tagSelected]}
                                    onPress={() => toggleStrength(strength)}
                                >
                                    <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                                        {strength}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* 자신 있는 돌봄 섹션 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            <Text style={styles.sectionIcon}>🩺</Text> 자신 있는 돌봄
                        </Text>
                        <Text style={styles.selectionCount}>
                            {selectedCareSkills.length}/{MAX_CARE_SKILLS}
                        </Text>
                    </View>
                    <View style={styles.tagsContainer}>
                        {CARE_SKILL_OPTIONS.map((skill) => {
                            const isSelected = selectedCareSkills.includes(skill);
                            return (
                                <TouchableOpacity
                                    key={skill}
                                    style={[styles.tag, isSelected && styles.tagSelected]}
                                    onPress={() => toggleCareSkill(skill)}
                                >
                                    <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                                        {skill}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* 하단 CTA 버튼 */}
            <View style={styles.buttonContainer}>
                <Button
                    title="등록하기"
                    onPress={handleSubmit}
                    disabled={!isFormValid}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 8,
        borderBottomColor: '#F3F4F6',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    sectionIcon: {
        fontSize: 16,
    },
    selectionCount: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 16,
    },
    textInputContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 14,
    },
    textInput: {
        fontSize: 15,
        color: '#111827',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    textInputFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    charCount: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    inputButton: {
        fontSize: 13,
        color: '#3B82F6',
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tag: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
    },
    tagSelected: {
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    tagText: {
        fontSize: 14,
        color: '#374151',
    },
    tagTextSelected: {
        color: '#3B82F6',
        fontWeight: '500',
    },
    buttonContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
});
