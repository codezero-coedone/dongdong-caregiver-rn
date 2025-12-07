import React, { useState } from 'react';
import { Image, LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

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
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                        {checked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
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
                    <Image
                        source={require('@/assets/images/icons/bottom_chervon.svg')}
                        style={[
                            styles.arrowIcon,
                            expanded && { transform: [{ rotate: '180deg' }] }
                        ]}
                    />
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
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    checkboxChecked: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    checkmark: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
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
    arrowIcon: {
        width: 20,
        height: 20,
    },
    arrow: {
        fontSize: 18,
        fontWeight: 'bold',
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
