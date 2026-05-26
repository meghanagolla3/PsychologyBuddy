import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdminLoading } from '@/src/contexts/AdminLoadingContext';

interface AdminLoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface AdminLoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: {
        name: string;
      };
      school?: {
        id: string;
        name: string;
      };
      adminProfile?: any;
    };
  };
}

export function useAdminLogin() {
  const [formData, setFormData] = useState<AdminLoginData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { executeWithLoading, setLoading } = useAdminLoading();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);

    try {
      const data = await executeWithLoading(
        'admin_login',
        fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }).then(res => res.json()),
        'Logging in...'
      );

      if (data.success && data.data?.user) {
        // Login user in context with required adminProfile
        const userWithProfile = {
          ...data.data.user,
          adminProfile: data.data.user.adminProfile || {}
        };
        login(userWithProfile);
        
        // Redirect based on role
        const userRole = data.data.user.role.name;
        
        // Keep loader active during redirect
        setLoading('admin_login', true, 'Redirecting...');
        
        setTimeout(() => {
          if (userRole === 'SUPERADMIN' || userRole === 'SCHOOL_SUPERADMIN') {
            router.push('/admin');
          } else if (userRole === 'ADMIN') {
            router.push('/admin');
          } else if (userRole === 'COUNSELOR') {
            router.push('/counselor');
          }else if (userRole === 'PARENT') {
            router.push('/parent');
          } else {
            router.push('/'); // Fallback
          }
        }, 1500);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Network error. Please check your connection and try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    // For now, show message that Google sign-in is not implemented
    setError('Google sign-in is not available. Please use email and password.');
  };

  const togglePassword = () => {
    setShowPassword(prev => !prev);
  };

  return {
    formData,
    loading: false,
    error,
    success,
    showPassword,
    handleChange,
    handleSubmit,
    handleGoogleSignIn,
    togglePassword,
  };
}
