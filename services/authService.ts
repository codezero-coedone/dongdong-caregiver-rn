// Mock Auth Service

export const requestPhoneVerification = async (phoneNumber: string): Promise<boolean> => {
    console.log(`[Mock] Requesting verification code for ${phoneNumber}`);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
};

export const verifyPhoneCode = async (phoneNumber: string, code: string): Promise<boolean> => {
    console.log(`[Mock] Verifying code ${code} for ${phoneNumber}`);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock success for code '123456'
    if (code === '123456') {
        return true;
    }
    return false;
};
