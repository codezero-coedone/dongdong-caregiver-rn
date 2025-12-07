import ChevronIcon from '@/assets/images/icons/bottom_chervon.svg';
import CheckboxOff from '@/assets/images/icons/checkbox_off.svg';
import CheckboxOn from '@/assets/images/icons/checkbox_on.svg';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TermsAccordionProps {
    title: string;
    required?: boolean;
    checked: boolean;
    onCheck: () => void;
    contentTitle?: string;
    contentDescription?: string;
}

const TermsAccordion = ({
    title,
    required = false,
    checked,
    onCheck,
    contentTitle = '제목',
    contentDescription = '제목에 대한 상세 내용을 입력해주세요.\n접은 상태를 기본값으로 사용하세요.',
}: TermsAccordionProps) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* Checkbox */}
                <TouchableOpacity onPress={onCheck} style={styles.checkboxContainer}>
                    {checked ? (
                        <CheckboxOn width={18} height={18} />
                    ) : (
                        <CheckboxOff width={18} height={18} />
                    )}
                </TouchableOpacity>

                {/* Title */}
                <TouchableOpacity onPress={onCheck} style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {required !== undefined && (
                        <Text style={[styles.tag, required ? styles.requiredTag : styles.optionalTag]}>
                            ({required ? '필수' : '선택'})
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Expand/Collapse Arrow */}
                <TouchableOpacity onPress={toggleExpand} style={styles.arrowContainer}>
                    <View style={expanded && { transform: [{ rotate: '180deg' }] }}>
                        <ChevronIcon width={20} height={20} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Expandable Content */}
            {expanded && (
                <View style={styles.content}>
                    <Text style={styles.contentTitle}>{contentTitle}</Text>
                    <Text style={styles.contentDescription}>{contentDescription}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    checkboxContainer: {
        marginRight: 12,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    tag: {
        fontSize: 14,
        marginLeft: 6,
    },
    requiredTag: {
        color: '#EF4444',
    },
    optionalTag: {
        color: '#3B82F6',
    },
    arrowContainer: {
        padding: 8,
    },
    content: {
        paddingHorizontal: 36,
        paddingBottom: 16,
    },
    contentTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    contentDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
});

export default TermsAccordion;
