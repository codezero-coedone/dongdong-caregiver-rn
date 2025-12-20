import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isValid?: boolean;
  containerClassName?: string;
  rightAddon?: React.ReactNode;
}

const ErrorIcon = () => (
  <View style={styles.iconWrapper}>
    <View style={styles.errorIcon}>
      <Text style={styles.iconText}>!</Text>
    </View>
  </View>
);

const SuccessIcon = () => (
  <View style={styles.successIcon}>
    <Text style={styles.iconText}>✓</Text>
  </View>
);

const Input = ({
  label,
  error,
  isValid,
  containerClassName = '',
  className = '',
  ...props
}: InputProps) => {
  const showSuccessIcon = isValid && !error;
  const showErrorIcon = !!error;

  const borderColor = showErrorIcon
    ? '#FF4242'
    : props.editable === false
    ? 'rgba(112,115,124,0.08)'
    : 'rgba(112,115,124,0.16)';

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View>
        <TextInput
          style={[styles.input, { borderColor }]}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {(showErrorIcon || showSuccessIcon) && (
          <View style={styles.iconAbsolute}>
            {showErrorIcon ? <ErrorIcon /> : <SuccessIcon />}
          </View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: 'rgba(46,47,51,0.88)',
  },
  input: {
    height: 48,
    paddingHorizontal: 12,
    paddingRight: 48,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#171719',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  iconAbsolute: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    width: 18,
    height: 18,
    backgroundColor: '#FF4242',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 22,
    height: 22,
    backgroundColor: '#0066FF',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 4,
    color: '#FF4242',
    fontSize: 12,
  },
});
