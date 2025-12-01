```typescript
import { create } from 'zustand';

type LoginType = 'kakao' | 'apple' | null;

interface AuthState {
  isLoggedIn: boolean;
  loginType: LoginType;
  error: string | null;
  login: (type: LoginType) => void;
  logout: () => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  loginType: null,
  error: null,
  login: (type) => set({ isLoggedIn: true, loginType: type, error: null }),
  logout: () => set({ isLoggedIn: false, loginType: null, error: null }),
  setError: (error) => set({ error }),
}));
```
