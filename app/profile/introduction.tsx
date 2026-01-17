import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/ui/Button';
import { apiClient } from '@/services/apiClient';

// 나만의 강점 옵션 (최대 3개)
const STRENGTH_OPTIONS = [
  '친절함',
  '책임감',
  '위생적인',
  '안전제일',
  '적극적',
  '인내심',
  '자상함',
  '믿음직',
  '세심함',
];

// 자신 있는 돌봄 옵션 (최대 5개)
const CARE_SKILL_OPTIONS = [
  '골절',
  '재활치료',
  '치매',
  '섬망',
  '파킨슨',
  '욕창',
  '외상 환자',
  '석션',
  '피딩',
  '소변줄',
  '장루',
  '기저귀 케어',
  '투석',
  '좌우 편마비',
  '하반신 마비',
  '전신 마비',
  '전염성 질환',
  '정신 질환',
  '자가 보행',
  '부축',
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
    setSelectedStrengths((prev) => {
      if (prev.includes(strength)) {
        return prev.filter((s) => s !== strength);
      }
      if (prev.length >= MAX_STRENGTHS) {
        Alert.alert(
          '알림',
          `나만의 강점은 최대 ${MAX_STRENGTHS}개까지 선택 가능합니다.`,
        );
        return prev;
      }
      return [...prev, strength];
    });
  };

  const toggleCareSkill = (skill: string) => {
    setSelectedCareSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      }
      if (prev.length >= MAX_CARE_SKILLS) {
        Alert.alert(
          '알림',
          `자신 있는 돌봄은 최대 ${MAX_CARE_SKILLS}개까지 선택 가능합니다.`,
        );
        return prev;
      }
      return [...prev, skill];
    });
  };

  const handleSubmit = () => {
    (async () => {
      try {
        await apiClient.put('/caregivers/profile', {
          introduction,
        });
        Alert.alert('완료', '자기소개가 등록되었습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          '자기소개 저장에 실패했습니다.';
        Alert.alert('오류', String(msg));
      }
    })();
  };

  const isFormValid =
    introduction.length > 0 ||
    selectedStrengths.length > 0 ||
    selectedCareSkills.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>프로필 수정</Text>

        <View style={{ width: 24 }} />
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
      >
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
                  <Text
                    style={[
                      styles.tagText,
                      isSelected && styles.tagTextSelected,
                    ]}
                  >
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
                  <Text
                    style={[
                      styles.tagText,
                      isSelected && styles.tagTextSelected,
                    ]}
                  >
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#70737C29',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 13,
    fontWeight: '500',
    color: '#37383C9C',
    marginBottom: 16,
  },
  textInputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#70737C29',
    padding: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#171719',
    // textAlignVertical: 'top',
  },
  textInputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  charCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#37383C9C',
  },
  inputButton: {
    fontSize: 16,
    color: '#37383C29',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#70737C29',
    backgroundColor: '#fff',
  },
  tagSelected: {
    borderColor: '#0066FF',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  tagText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#37383C9C',
  },
  tagTextSelected: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0066FF',
  },
  buttonContainer: {
    padding: 20,
  },
});
