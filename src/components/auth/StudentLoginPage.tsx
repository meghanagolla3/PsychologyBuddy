'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import {StudentLoginForm} from '../forms/StudentLoginForm';
import { AlertMessage } from '@/components/ui/AlertMessage';

export default function StudentLoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentId: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/student-login', {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">PB</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Student Login</h2>
          <p className="mt-2 text-gray-600">Access your student dashboard</p>
        </div>

        {error && <AlertMessage type="error" message={error} />}
        {success && <AlertMessage type="success" message={success} />}

        <StudentLoginForm
          formData={formData}
          loading={isSubmitting}
          error={error}
          success={success}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />

        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Are you an administrator? Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}

