import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

export default function MyScreen() {
    const { caregiverInfo, careerInfo, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>MY</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color="#9CA3AF" />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>
                            {caregiverInfo?.name || '간병인'}
                        </Text>
                        <Text style={styles.profilePhone}>
                            {caregiverInfo?.phone || ''}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="pencil" size={18} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.menuSectionTitle}>내 정보</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="document-text-outline" size={22} color="#374151" />
                        <Text style={styles.menuItemText}>내 자격증 관리</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="briefcase-outline" size={22} color="#374151" />
                        <Text style={styles.menuItemText}>지원 내역</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="heart-outline" size={22} color="#374151" />
                        <Text style={styles.menuItemText}>관심 공고</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.menuSectionTitle}>설정</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="notifications-outline" size={22} color="#374151" />
                        <Text style={styles.menuItemText}>알림 설정</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="help-circle-outline" size={22} color="#374151" />
                        <Text style={styles.menuItemText}>고객센터</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="document-outline" size={22} color="#374151" />
                        <Text style={styles.menuItemText}>약관 및 정책</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>로그아웃</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.version}>버전 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    profilePhone: {
        fontSize: 14,
        color: '#6B7280',
    },
    editButton: {
        padding: 8,
    },
    menuSection: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    menuSectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#9CA3AF',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    menuItemText: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
        marginLeft: 12,
    },
    logoutButton: {
        marginHorizontal: 20,
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    logoutButtonText: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    version: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});
