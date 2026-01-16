import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface MaskedRRNInputProps {
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  editable?: boolean;
  error?: string;
  isValid?: boolean;
}

const MaskedRRNInput = ({
  value,
  onChangeText,
  maxLength = 7,
  editable = true,
  error,
  isValid,
}: MaskedRRNInputProps) => {
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    if (!editable) return;
    inputRef.current?.focus();
  };

  const showErrorIcon = Boolean(error);
  const showSuccessIcon = Boolean(isValid) && !showErrorIcon;

  const borderColor = showErrorIcon
    ? '#FF4242'
    : editable === false
      ? 'rgba(112,115,124,0.08)'
      : 'rgba(112,115,124,0.16)';

  const backgroundColor = showErrorIcon ? '#FEF2F2' : 'transparent';

  const renderDigits = () => {
    const raw = String(value || '').replace(/[^\d]/g, '').slice(0, maxLength);
    const filled = raw.length;

    // Empty state: show placeholder bullets only (no leading '0')
    if (filled === 0) {
      return (
        <Text style={styles.maskWrapper} accessible accessibilityRole="text">
          <Text style={styles.maskedEmpty}>{'●'.repeat(maxLength)}</Text>
        </Text>
      );
    }

    const firstChar = raw[0] || '';
    const restFilledCount = Math.max(0, filled - 1);
    const restEmptyCount = Math.max(0, (maxLength - 1) - restFilledCount);

    return (
      <Text style={styles.maskWrapper} accessible accessibilityRole="text">
        <Text
          style={[
            styles.firstDigit,
            {
              color: '#171719',
            },
          ]}
        >
          {firstChar}
        </Text>
        <Text style={styles.maskedFilled}>{'●'.repeat(restFilledCount)}</Text>
        <Text style={styles.maskedEmpty}>{'●'.repeat(restEmptyCount)}</Text>
      </Text>
    );
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[styles.container, { borderColor, backgroundColor }]}
      >
        {renderDigits()}
        {(showErrorIcon || showSuccessIcon) && (
          <View style={styles.iconAbsolute}>
            {showErrorIcon ? (
              <View style={styles.errorIcon}>
                <Text style={styles.iconText}>!</Text>
              </View>
            ) : (
              <View style={styles.successIcon}>
                <Text style={styles.iconText}>✓</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{String(error)}</Text> : null}
      {/* Hidden TextInput for keyboard */}
      <TextInput
        ref={inputRef}
        style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
        keyboardType="number-pad"
        maxLength={maxLength}
        value={String(value || '')}
        onChangeText={(t) => onChangeText(String(t || '').replace(/[^\d]/g, '').slice(0, maxLength))}
        editable={editable}
        importantForAutofill="no"
      />
    </View>
  );
};

export default MaskedRRNInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    // SSOT: Textfield = 48px height, 12px radius, 12px padding
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    paddingRight: 44,
    paddingVertical: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  firstDigit: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.0912,
  },
  maskWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maskedFilled: {
    fontSize: 16,
    color: '#171719',
    fontWeight: '400',
    letterSpacing: 0.0912,
  },
  maskedEmpty: {
    fontSize: 16,
    color: 'rgba(55,56,60,0.28)',
    fontWeight: '400',
    letterSpacing: 0.0912,
  },
  iconAbsolute: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
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
