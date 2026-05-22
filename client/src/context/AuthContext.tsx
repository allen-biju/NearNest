import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface IUserAddress {
  label: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  isDefault: boolean;
}

export interface IUser {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  role: string[]; // ['buyer', 'seller', 'admin', 'superadmin']
  walletBalance: number;
  referralCode: string;
  addresses?: IUserAddress[];
}

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (loginId: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  addAddress: (addressData: any) => Promise<boolean>;
  updateWalletBalance: (amt: number) => void;
  // Quick-switch role for testing/seeding convenience
  activeRole: string;
  setActiveRole: (role: string) => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nn_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<string>('buyer');

  useEffect(() => {
    if (token) {
      refetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const refetchUser = async () => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        // Default activeRole to seller if they are a seller, or admin if admin
        if (data.data.role.includes('superadmin') || data.data.role.includes('admin')) {
          setActiveRole('admin');
        } else if (data.data.role.includes('seller')) {
          setActiveRole('seller');
        } else {
          setActiveRole('buyer');
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to refetch user info:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginId: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('nn_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        return true;
      } else {
        alert(data.error?.message || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('nn_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        return true;
      } else {
        alert(data.error?.message || 'Signup failed');
        return false;
      }
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('nn_token');
    setToken(null);
    setUser(null);
    setActiveRole('buyer');
  };

  const addAddress = async (addressData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/auth/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });
      const data = await res.json();
      if (data.success) {
        await refetchUser();
        return true;
      } else {
        alert(data.error?.message || 'Failed to add address');
        return false;
      }
    } catch (err) {
      console.error('Address creation error:', err);
      return false;
    }
  };

  const updateWalletBalance = (amt: number) => {
    if (user) {
      setUser({ ...user, walletBalance: amt });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      signup,
      logout,
      addAddress,
      updateWalletBalance,
      activeRole,
      setActiveRole,
      refetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
