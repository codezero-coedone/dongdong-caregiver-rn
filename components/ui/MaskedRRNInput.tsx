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
}

const MaskedRRNInput = ({
  value,
  onChangeText,
  maxLength = 7,
}: MaskedRRNInputProps) => {
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const renderDigits = () => {
    // Show first character (or placeholder '0') then masked bullets for remaining positions.
    const firstChar = value && value.length > 0 ? value[0] : '0';
    const rest = value ? value.slice(1) : '';
    const filledCount = Array.from(rest).filter(
      (c) => typeof c === 'string' && c.length > 0,
    ).length;
    const totalMasked = Math.max(0, maxLength - 1);
    const emptyCount = Math.max(0, totalMasked - filledCount);

    return (
      <Text style={styles.maskWrapper} accessible accessibilityRole="text">
        <Text
          style={[
            styles.firstDigit,
            {
              color:
                value && value.length > 0 ? '#171719' : 'rgba(55,56,60,0.28)',
            },
          ]}
        >
          {firstChar}
        </Text>
        <Text style={[styles.maskedFilled]}>{'●'.repeat(filledCount)}</Text>
        <Text style={[styles.maskedEmpty]}>{'●'.repeat(emptyCount)}</Text>
      </Text>
    );
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.container}
      >
        {renderDigits()}
      </TouchableOpacity>
      {/* Hidden TextInput for keyboard */}
      <TextInput
        ref={inputRef}
        style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
        keyboardType="number-pad"
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
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
    borderColor: 'rgba(112,115,124,0.16)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  digitContainer: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
});
