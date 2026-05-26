import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Phone, GraduationCap, Heart, User, ShieldCheck, ShieldQuestion, FileText, HelpCircle, PhoneCall } from 'lucide-react';
import { useAdminLogin } from '@/src/hooks/auth/useAdminLogin';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { AdminLoadingProvider } from '@/src/contexts/AdminLoadingContext';
import { PageIllustration } from '@/components/LandingPage/components/PageIllustration';
import { Input } from '../ui/input';

export default function LoginPage() {
  return (
    <AdminLoadingProvider>
      <LoginPageContent />
    </AdminLoadingProvider>
  );
}

function LoginPageContent() {
  const [role, setRole] = useState<'student' | 'parent' | 'counselor' | 'admin'>('admin');
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize role from URL parameter if present
  React.useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['student', 'parent', 'counselor', 'admin'].includes(roleParam)) {
      setRole(roleParam as 'student' | 'parent' | 'counselor' | 'admin');
    }
  }, [searchParams]);

  const {
    formData,
    loading,
    error,
    success,
    showPassword,
    handleChange,
    handleSubmit,
    togglePassword,
  } = useAdminLogin();

  const roles = [
    { key: 'student' as const, label: 'Student', img: '/assets/avatar-student.png', badge: GraduationCap, badgeBg: 'bg-brand-soft', badgeColor: 'text-brand' },
    { key: 'parent' as const, label: 'Parent', img: '/assets/avatar-parent.png', badge: Heart, badgeBg: 'bg-[oklch(0.96_0.04_18)]', badgeColor: 'text-heart' },
    { key: 'counselor' as const, label: 'Counselor', img: '/assets/avatar-counselor.png', badge: User, badgeBg: 'bg-[oklch(0.95_0.04_240)]', badgeColor: 'text-info' },
    { key: 'admin' as const, label: 'Admin', img: '/assets/avatar-admin.png', badge: ShieldCheck, badgeBg: 'bg-[oklch(0.95_0.04_155)]', badgeColor: 'text-shield' },
  ];

  const handleRoleChange = (newRole: 'student' | 'parent' | 'counselor' | 'admin') => {
    setRole(newRole);
    // Redirect to student login page only for student role
    if (newRole === 'student') {
      router.push('/student-login');
    }
    // Update URL for parent, counselor, and admin to maintain role selection
    else {
      router.push(`/login?role=${newRole}`);
    }
  };

  return (
    <div className="flex min-h-screen relative">
      <PageIllustration />
      
      {/* Right Side - New Design */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <header className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <img src="/assets/logo-psybuddy.png" alt="Psychology Buddy mascot" width={48} height={48} className="h-12 w-12" />
              <div className="text-left leading-tight">
                <div className="text-lg font-extrabold tracking-tight">Psychology</div>
                <div className="-mt-1 text-lg font-extrabold tracking-tight text-brand">Buddy</div>
              </div>
            </div>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
              Welcome back! <span aria-hidden>👋</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your wellbeing matters. We're here for you.
            </p>
          </header>

          {/* Role selector */}
          <section className="mt-7">
            <h2 className="text-sm font-semibold">Login as</h2>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {roles.map((r) => {
                const Badge = r.badge;
                const active = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleRoleChange(r.key)}
                    className={`group relative flex flex-col items-center rounded-2xl border bg-card p-2 transition-all ${
                      active
                        ? 'border-brand ring-2 ring-brand/30 shadow-[var(--shadow-soft)]'
                        : 'border-border hover:border-brand/40'
                    }`}
                    aria-pressed={active}
                  >
                    <span className={`absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${r.badgeBg} pointer-events-none`}>
                      <Badge className={`h-3 w-3 ${r.badgeColor}`} />
                    </span>
                    <img src={r.img} alt="" width={96} height={96} loading="lazy" className="h-14 w-14 object-contain" />
                    <span className={`mt-1 text-xs font-semibold ${active ? 'text-brand' : 'text-foreground'}`}>
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Form card */}
          <section className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {error && <AlertMessage type="error" message={error} />}
              {success && <AlertMessage type="success" message={success} />}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground "
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm outline-none placeholder:text-muted-foreground"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPw((v) => !v);
                      togglePassword();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl text-base font-bold text-brand-foreground shadow-[var(--shadow-card)] transition-transform active:scale-[0.99] disabled:opacity-50"
                style={{ backgroundImage: 'var(--gradient-brand)' }}
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>

              <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-brand/30 bg-background text-sm font-semibold text-brand hover:bg-brand-soft"
              >
                <Phone className="h-4 w-4" />
                Login with OTP
              </button>
            </form>
          </section>

          {/* <nav className="grid grid-cols-4 gap-2 text-center text-[11px] text-muted-foreground">
            <FooterItem icon={ShieldQuestion} label="Privacy Policy" />
            <FooterItem icon={FileText} label="Terms & Conditions" />
            <FooterItem icon={HelpCircle} label="Help & Support" />
            <FooterItem icon={PhoneCall} label="Contact Us" />
          </nav> */}
        </div>
      </div>
    </div>
  );
}

function FooterItem({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <a href="#" className="flex flex-col items-center gap-1 hover:text-brand">
      <Icon className="h-4 w-4 text-brand" />
      <span>{label}</span>
    </a>
  );
}