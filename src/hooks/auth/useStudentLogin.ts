import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';

interface StudentLoginData {
  studentId: string;
  password: string;
}

interface StudentLoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      studentId: string;
      firstName: string;
      lastName: string;
      role: {
        name: string;
      };
      school?: {
        id: string;
        name: string;
      };
      classRef?: {
        id: string;
        name: string;
        grade: number;
        section: string;
      };
    };
  };
}

export function useStudentLogin() {
  const [formData, setFormData] = useState<StudentLoginData>({
    studentId: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.studentId || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.studentId.length < 3) {
      setError('Student ID must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: StudentLoginResponse = await response.json();

      if (data.success && data.data?.user) {
        setSuccess('Login successful! Redirecting to student portal...');
        
        // Login user in context
        login(data.data.user);
        
        // Redirect to student dashboard
        setTimeout(() => {
          router.push('/students/mood-checkin');
        }, 1500);
      } else {
        setError(data.message || 'Login failed. Please check your credentials and try again.');
      }
    } catch (err) {
      console.error('Student login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    success,
    handleChange,
    handleSubmit,
  };
}
