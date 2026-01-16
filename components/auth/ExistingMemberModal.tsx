import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExistingMemberModalProps {
    visible: boolean;
    onClose: () => void;
}

const ExistingMemberModal = ({ visible, onClose }: ExistingMemberModalProps) => {
    const router = useRouter();

    const handleGoToLogin = () => {
        onClose();
        router.replace('/onboarding/step3');
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            accessibilityViewIsModal={true}
            accessibilityLabel="이미 가입된 회원 알림"
        >
            <TouchableOpacity
                style={styles.centeredView}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={styles.modalView}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Text style={styles.modalTitle}>이미 가입된 회원</Text>
                    <Text style={styles.modalDesc}>
                        해당 휴대폰 번호로{'\n'}가입된 계정이 존재합니다.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleGoToLogin}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="다른 수단으로 로그인"
                    >
                        <Text style={styles.textStyle}>다른 수단으로 로그인</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingTop: 24,
        paddingBottom: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 10,
        color: '#111827',
    },
    modalDesc: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
        color: '#111827',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#0066FF',
        borderRadius: 14,
        height: 56,
        width: '85%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textStyle: {
        color: 'white',
        fontWeight: '800',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default ExistingMemberModal;
