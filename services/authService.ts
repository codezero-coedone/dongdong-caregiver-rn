// Mock Auth Service

// Store for mock verification codes (in real app, this would be on server)
const mockVerificationCodes: Record<string, string> = {};

/**
 * Request phone verification - sends a verification code to the phone number
 * Mock: generates a random 4-digit code
 */
export const requestPhoneVerification = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    console.log(`[Mock] Requesting verification code for ${phoneNumber}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate a random 4-digit code for mock purposes
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    mockVerificationCodes[phoneNumber] = code;

    console.log(`[Mock] Generated verification code: ${code} for ${phoneNumber}`);

    return {
        success: true,
        message: `인증번호가 발송되었습니다. (테스트 코드: ${code})`
    };
};

/**
 * Verify phone code - checks if the provided code matches
 * Mock: compares against stored code, also accepts '1234' as universal test code
 */
export const verifyPhoneCode = async (phoneNumber: string, code: string): Promise<{ success: boolean; message: string }> => {
    console.log(`[Mock] Verifying code ${code} for ${phoneNumber}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const storedCode = mockVerificationCodes[phoneNumber];

    // Accept the stored code or '1234' as a universal test code
    if (code === storedCode || code === '1234') {
        // Clean up the stored code after successful verification
        delete mockVerificationCodes[phoneNumber];
        return {
            success: true,
            message: '인증이 완료되었습니다.'
        };
    }

    return {
        success: false,
        message: '인증번호가 올바르지 않습니다.'
    };
};
