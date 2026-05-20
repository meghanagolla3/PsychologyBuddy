"use client";

import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <footer className="bg-[#1B9EE0] text-white w-full">
      <div className="max-w-8xl mx-auto px-6 sm:px-6 lg:px-24 py-5">
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-8 lg:gap-4">
          
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/Logo.png"
                alt="Psychology Buddy Logo"
                width={47}
                height={47}
                className="w-[42px] h-[42px]"
              />
              <span className="font-semibold text-lg sm:text-xl lg:text-[16px] leading-tight">
                Psychology Buddy
              </span>
            </div>
            <p className="text-sm sm:text-base lg:text-[12px] text-[#EFEFEF]/70 leading-relaxed max-w-[280px] lg:max-w-none">
              Supporting student mental health through accessible, compassionate
              resources.
            </p>
          </div>

          {/* Platform, Company, and Legal sections */}
          <div className="col-span-2 lg:col-span-3 grid grid-cols-3 gap-3 xs:gap-5 lg:gap-1 lg:ml-15">
            {/* Platform */}
            <div>
              <h3 className="font-semibold text-sm xs:text-[16px] sm:text-xl lg:text-[16px] mb-3 sm:mb-4">
                Platform
              </h3>
              <ul className="space-y-3 text-[11px] xs:text-sm sm:text-base lg:text-[12px] text-[#EFEFEF]/70">
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="hover:text-white transition-colors text-left"
                  >
                    How it work
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-sm xs:text-[16px] sm:text-xl lg:text-[16px] mb-3 sm:mb-4">
                Company
              </h3>
              <ul className="space-y-3 text-[11px] xs:text-sm sm:text-base lg:text-[12px] text-[#EFEFEF]/70">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/forschools" className="hover:text-white transition-colors">
                    For Schools
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("mission")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Mission
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="col-span-1">
              <h3 className="font-semibold text-sm xs:text-[16px] sm:text-xl lg:text-[16px] mb-3 sm:mb-4">
                Legal
              </h3>
              <ul className="space-y-3 text-[11px] xs:text-sm sm:text-base lg:text-[12px] text-[#EFEFEF]/70">
                <li>
                  <Link href="/termsandconditions" className="hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider Line on Mobile (Before Connect block) */}
          <hr className="w-full border-[#D3D0D0]/30 lg:hidden -my-2" />

          {/* Connect */}
          <div className="col-span-2 lg:col-span-1 text-center lg:text-left">
            <h3 className="hidden lg:block font-semibold text-[16px] sm:text-xl lg:text-[16px] mb-4">
              Connect with us
            </h3>
            <div className="flex justify-center lg:justify-start gap-4 mb-5">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/abhyaas-educorp/"
                aria-label="LinkedIn"
                className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/footer/l.svg"
                  alt="LinkedIn"
                  width={80}
                  height={80}
                  className="object-contain w-8 h-8"
                />
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/abhyaas/"
                aria-label="Facebook"
                className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/footer/f.svg"
                  alt="Facebook"
                  width={80}
                  height={80}
                  className="object-contain w-8 h-8"
                />
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/channel/UCBe9r17gYiIBp0Z-3P9PENg"
                aria-label="YouTube"
                className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/footer/y.svg"
                  alt="YouTube"
                  width={80}
                  height={80}
                  className="object-contain w-8 h-8"
                />
              </a>

              {/* Twitter/X */}
              <a
                href="https://x.com/abhyaasec"
                aria-label="Twitter"
                className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/footer/t.svg"
                  alt="Twitter"
                  width={80}
                  height={80}
                  className="object-contain w-8 h-8"
                />
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/8341680090"
                aria-label="WhatsApp"
                className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/footer/w.svg"
                  alt="WhatsApp"
                  width={80}
                  height={80}
                  className="object-contain w-8 h-8"
                />
              </a>
            </div>

            <a href="mailto:hello@edmark.in" className="text-sm sm:text-base lg:text-[12px] text-[#EFEFEF]/70 mb-2">hello@edmark.in</a>
             
          
            <p className="text-sm sm:text-base lg:text-[12px] text-[#EFEFEF]/70">
              91+8341680090
            </p>
          </div>
        </div>

        {/* Bottom copyright area */}
        <div className="border-t border-[#D3D0D0]/30 lg:border-[#D3D0D0] mt-6 lg:mt-10 pt-4 flex flex-col md:flex-row justify-between items-center gap-2.5 text-[10px] xs:text-[12px] sm:text-sm text-[#EFEFEF]/70 text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} Psychology Buddy. All rights reserved.</p>
          <p className="flex items-center gap-1 justify-center md:justify-start">
            Made with <span>
              ♡</span> for student wellbeing
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;