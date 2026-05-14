'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { LoginForm } from '../../components/forms/LoginForm';
import { AlertMessage } from '@/components/ui/AlertMessage';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success && data.data?.user) {
        login(data.data.user);
        setSuccess('Login successful! Redirecting...');

        // Redirect based on role
        setTimeout(() => {
          switch (data.data.user.role.name) {
            case 'STUDENT':
              router.push('/students');
              break;
            case 'COUNSELOR':
              router.push('/counselor');
              break;
            case 'PARENT':
              router.push('/parent');
              break;
            case 'ADMIN':
            case 'SUPERADMIN':
            case 'SCHOOL_SUPERADMIN':
              router.push('/admin');
              break;
            default:
              router.push('/');
              break;
          }
        }, 1000);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already logged in, redirect based on role
  React.useEffect(() => {
    if (!loading && user) {
      switch (user.role.name) {
        case 'STUDENT':
          router.push('/students');
          break;
        case 'COUNSELOR':
          router.push('/counselor');
          break;
        case 'PARENT':
          router.push('/parent');
          break;
        case 'ADMIN':
        case 'SUPERADMIN':
        case 'SCHOOL_SUPERADMIN':
          router.push('/admin');
          break;
        default:
          router.push('/');
          break;
      }
    }
  }, [user, loading, router]);

  const onTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    console.log('Google sign-in not implemented yet');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">PB</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Login</h2>
          <p className="mt-2 text-gray-600">Access your admin, counselor, or parent dashboard</p>
        </div>

        {error && <AlertMessage type="error" message={error} />}
        {success && <AlertMessage type="success" message={success} />}

        <LoginForm
          formData={formData}
          showPassword={showPassword}
          loading={isSubmitting}
          error={error}
          success={success}
          onChange={handleChange}
          onTogglePassword={onTogglePassword}
          onSubmit={handleSubmit}
          onGoogleSignIn={onGoogleSignIn}
          isGoogleLoading={false}
        />

        <div className="text-center space-y-4">
          <button
            onClick={() => router.push('/student-login')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Are you a student? Access with School ID
          </button>
          
          <div className="text-sm text-gray-600">
            Prefer phone login?{' '}
            <button
              onClick={() => router.push('/admin-login-phone')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Login with Phone Number
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
