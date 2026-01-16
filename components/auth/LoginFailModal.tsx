import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  message?: string;
};

export default function LoginFailModal({
  visible,
  onClose,
  message = '입력한 정보가 올바르지 않아요.\n다시 한 번 확인해 주세요.',
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>로그인 실패</Text>
          <Text style={styles.desc}>{message}</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.btnText}>확인</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '86%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 18,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  desc: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    color: '#111827',
    marginBottom: 16,
  },
  btn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LoginFailModalProps {
    visible: boolean;
    onClose: () => void;
    message?: string;
}

const LoginFailModal = ({ visible, onClose, message = '로그인 실패' }: LoginFailModalProps) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>로그인 실패</Text>

                    <View style={styles.contentContainer}>
                        <Text style={styles.modalText}>{message}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.textStyle}>확인</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        width: '80%',
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
        backgroundColor: '#F5F6F8', // Light gray background for message area
        paddingVertical: 30,
        marginBottom: 20,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 30,
        width: '80%',
        elevation: 2,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default LoginFailModal;
