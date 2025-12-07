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

                    <View style={styles.contentContainer}>
                        {/* Empty content area like the reference image */}
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleGoToLogin}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="로그인 하러가기"
                    >
                        <Text style={styles.textStyle}>로그인 하러가기</Text>
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
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#000',
    },
    contentContainer: {
        width: '100%',
        backgroundColor: '#F5F6F8',
        paddingVertical: 50,
        marginBottom: 20,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 30,
        width: '85%',
        elevation: 2,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default ExistingMemberModal;
