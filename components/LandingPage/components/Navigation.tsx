import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";

const Navigation: React.FC = () => {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);

  const handleGetStarted = async () => {
    // If user is already logged in, redirect to their dashboard
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
          router.push('/login');
          break;
      }
    } else if (!loading) {
      // If not loading and no user (might be on landing page where auth is skipped),
      // try to refresh user data first
      await refreshUser();
      // Check again after refresh
      const updatedUser = await fetch('/api/auth/me').then(res => res.json()).then(data => data.data?.user).catch(() => null);
      if (updatedUser) {
        switch (updatedUser.role.name) {
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
            router.push('/login');
            break;
        }
      } else {
        // If still no user after refresh, redirect to login page
        router.push('/login');
      }
    }
  };

  return (
    <nav className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300">
      {/* Nav Container */}
      <div
        className="
          flex items-center justify-between
          px-2 py-1 sm:px-4 sm:py-2  rounded-full 
          bg-white/40 border-[0.1px] border-white/40
          shadow-[0_4px_20px_rgba(0,0,0,0.08)]
          ring-1 ring-white/40
          backdrop-blur-md
        "
      >
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/Logo.png"
            alt="Psychology Buddy Logo"
            width={45}
            height={45}
            className="w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] object-contain"
          />
          <span className="font-semibold text-[16px] sm:text-xl lg:text-[17px] bg-gradient-to-b from-[#00A7DA] to-[#0F71A1] bg-clip-text text-transparent leading-tight">
            Psychology Buddy
          </span>
        </Link>

        {/* Desktop Nav Links (Matching your design figure) */}
        <div className="hidden md:flex items-center gap-8 ml-auto text-[#01243C] text-[15px] font-medium">
          <Link href="/about" className="hover:text-[#1B9EE0] transition">
            About us
          </Link>
          <Link href="/contact" className="hover:text-[#1B9EE0] transition">
            Contact us
          </Link>
          <Link href="/forschools" className="hover:text-[#1B9EE0] transition">
            For schools
          </Link>
        </div>

        {/* Actions (Desktop: CTA, Mobile: Hamburger) */}
        <div className="flex items-center gap-3">
          {/* CTA Button - Desktop only */}
          <Button
            onClick={handleGetStarted}
            className="
              hidden sm:inline-flex
              bg-gradient-to-b from-[#4FC1F9] to-[#1B9EE0]
              text-[15px] text-white
              px-[16px] py-[6px]
              h-auto ml-5
              rounded-[24px]
              font-medium
              hover:bg-[#1588c2]
              transition-all duration-200
              shadow-md hover:shadow-lg
            "
          >
            Lets Started
          </Button>

          {/* Hamburger Menu - Mobile only */}
          <button
            aria-label="Toggle Menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden flex items-center justify-center rounded-full p-2 text-[#01243C] hover:bg-white/30 transition"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {open && (
        <div
          className="
            mt-2 w-full rounded-3xl p-5 md:hidden
            bg-white/80 border-[0.2px] border-white/40
            shadow-[0_8px_30px_rgba(0,0,0,0.1)]
            backdrop-blur-lg
            animate-in fade-in slide-in-from-top-2 duration-200
          "
        >
          <ul className="flex flex-col gap-4 text-[#01243C] text-[15px] font-medium mb-4">
            <li>
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="block py-1 hover:text-[#1B9EE0] transition border-b border-black/5"
              >
                About us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="block py-1 hover:text-[#1B9EE0] transition border-b border-black/5"
              >
                Contact us
              </Link>
            </li>
            <li>
              <Link
                href="/forschools"
                onClick={() => setOpen(false)}
                className="block py-1 hover:text-[#1B9EE0] transition border-b border-black/5"
              >
                For schools
              </Link>
            </li>
          </ul>

          {/* CTA Button on Mobile */}
          <Button
            onClick={() => {
              setOpen(false);
              handleGetStarted();
            }}
            className="
              w-full
              bg-gradient-to-b from-[#4FC1F9] to-[#1B9EE0]
              text-[15px] text-white
              py-2.5
              h-auto
              rounded-[24px]
              font-medium
              shadow-md
            "
          >
            Lets Started
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

