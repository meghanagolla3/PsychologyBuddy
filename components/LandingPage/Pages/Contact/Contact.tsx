import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui";


const ContactPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    schoolName: "",
    email: "",
    phone: "",
    message: "",
    agreed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: { target: { name: any; value: any; type: any; checked?: any; }; }) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.agreed) {
      setSubmitStatus("error");
      setErrorMessage("You must agree to our friendly privacy policy to send a message.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message. Please try again later.");
      }

      setSubmitStatus("success");
      setForm({
        fullName: "",
        schoolName: "",
        email: "",
        phone: "",
        message: "",
        agreed: false,
      });
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#F4F6F9]">
      {/* Hero Banner */}
      <div className="relative w-full h-[190px] sm:h-[260px] md:h-[205px] lg:h-[320px] bg-gradient-to-b from-[#1f94ce] to-[#1e8cc6] overflow-hidden">
        {/* Mobile Background Image */}
        <Image 
          src="/about/Frame 50126388 (1).svg" 
          alt="Psychology Buddy Mobile Background" 
          fill
          className="object-contain object-bottom md:hidden"
        />
        {/* Desktop Background Image */}
        <Image 
          src="/about/2.svg" 
          alt="Psychology Buddy Background" 
          fill
          className="object-contain object-bottom hidden md:block"
        />
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-12 md:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Chat to sales */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-4 flex items-start gap-3 sm:gap-4 md:gap-5 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow">
            <div className="rounded-full bg-[#e8f6fd] flex items-center justify-center flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-10 md:h-10 overflow-hidden">
              <Image 
                src="/contact/1.svg" 
                alt="Chat to sales" 
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-[#2F3D43] text-[13px] sm:text-[16px] md:text-[16px] lg:text-[20px] leading-tight">Chat to sales</p>
              <p className="text-[#767676] text-[11px] sm:text-[13px] md:text-[12px] lg:text-[16px] leading-normal mb-1">Speak to our team.</p>
              <p className="text-[#686D70] text-[10px] sm:text-[12px] md:text-[11px] lg:text-[15px] font-medium break-all leading-none">support@abhyaas.in</p>
            </div>
          </div>

          {/* Call us */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-4 flex items-start gap-3 sm:gap-4 md:gap-5 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow">
            <div className="rounded-full bg-[#e8f6fd] flex items-center justify-center flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-10 md:h-10 overflow-hidden">
              <Image 
                src="/contact/2.svg" 
                alt="Call us" 
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-[#2F3D43] text-[13px] sm:text-[16px] md:text-[16px] lg:text-[20px] leading-tight">Call us</p>
              <p className="text-[#767676] text-[11px] sm:text-[13px] md:text-[11px] lg:text-[16px] leading-normal mb-1">Mon-Fri 9am to 5pm.</p>
              <p className="text-[#686D70] text-[10px] sm:text-[12px] md:text-[11px] lg:text-[15px] font-medium leading-none">+91+ 8790778111</p>
            </div>
          </div>

          {/* Visit us */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-4 flex items-start gap-3 sm:gap-4 md:gap-4 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow col-span-1">
            <div className="rounded-full bg-[#e8f6fd] flex items-center justify-center flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-10 md:h-10 overflow-hidden">
              <Image 
                src="/contact/3.svg" 
                alt="Visit us" 
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-[#2F3D43] text-[13px] sm:text-[16px] md:text-[16px] lg:text-[20px] leading-tight">Visit us</p>
              <p className="text-[#767676] text-[11px] sm:text-[13px] md:text-[12px] lg:text-[16px] leading-normal mb-1">Visit our office HQ.</p>
              <p className="text-[#686D70] text-[10px] sm:text-[12px] md:text-[10px] lg:text-[15px] font-medium leading-none">PragatiNagar,Hyderabad</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form + Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 pb-16 sm:pb-20 md:pb-24 lg:pb-28">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Form */}
            <div className="p-8 sm:p-10 md:p-10 lg:p-16 flex flex-col justify-center items-center text-center">
              <p className="text-[#1B9EE0] text-xs sm:text-sm md:text-base lg:text-lg font-semibold mb-2">Contact us</p>
              <h2 className="text-2xl sm:text-3xl md:text-[36px] lg:text-[42px] font-bold text-[#2F3D43] mb-2 sm:mb-3">Get in touch</h2>
              <p className="text-[#686D70] text-sm sm:text-base md:text-[18px] lg:text-[20px] mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-md">
                We'd love to hear from you. Please fill out this form.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 w-full text-left">
                <div>
                  <label className="block text-xs sm:text-sm md:text-base lg:text-[15px] font-medium text-[#344054] mb-1.5">First full name</label>
                  <Input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-gray-200 text-sm focus:border-[#1B9EE0] focus:ring-1 focus:ring-[#1B9EE0]"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm md:text-base lg:text-[15px] font-medium text-[#344054] mb-1.5">School/Institution Name</label>
                  <Input
                    type="text"
                    name="schoolName"
                    value={form.schoolName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-gray-200 text-sm focus:border-[#1B9EE0] focus:ring-1 focus:ring-[#1B9EE0]"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm md:text-base lg:text-[15px] font-medium text-[#344054] mb-1.5">Email ID</label>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-gray-200 text-sm focus:border-[#1B9EE0] focus:ring-1 focus:ring-[#1B9EE0]"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm md:text-base lg:text-[15px] font-medium text-[#344054] mb-1.5">Phone number</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:ring-1 focus-within:ring-[#1B9EE0] focus-within:border-[#1B9EE0]">
                    <select className="text-sm text-gray-700 bg-transparent focus:outline-none cursor-pointer">
                      <option value="IN">IN</option>
                      <option value="US">US</option>
                      <option value="UK">UK</option>
                    </select>
                    <span className="text-gray-300 text-sm">|</span>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 0000000000"
                      className="flex-1 text-sm bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm md:text-base lg:text-[15px] font-medium text-[#344054] mb-1.5">Message</label>
                  <Textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#1B9EE0] focus:border-[#1B9EE0] transition resize-none"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Input
                    type="checkbox"
                    name="agreed"
                    id="agree"
                    checked={form.agreed}
                    onChange={handleChange}
                    className="w-5 h-5 mt-0.5 accent-[#1B9EE0]"
                  />
                  <label htmlFor="agree" className="text-xs sm:text-sm md:text-base lg:text-[16px] text-[#667085] leading-normal">
                    You agree to our friendly{" "}
                    <Link href="#" className="text-[#1a9fd4] underline">privacy policy</Link>.
                  </label>
                </div>

                {submitStatus === "success" && (
                  <div className="p-4 rounded-xl bg-green-50 text-green-700 text-sm sm:text-base md:text-[16px] border border-green-200 font-medium">
                    ✓ Your message has been sent successfully. We'll get back to you soon!
                  </div>
                )}
                {submitStatus === "error" && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm sm:text-base md:text-[16px] border border-red-200 font-medium font-sans">
                    ⚠ {errorMessage || "Failed to send message. Please try again."}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1B9EE0] hover:bg-[#1589b8] disabled:bg-[#1B9EE0]/60 text-white font-semibold text-sm sm:text-base md:text-[18px] lg:text-[20px] py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-[16px] transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : "Send message"}
                </button>
              </form>
            </div>

            {/* Map */}
            <div className="h-[350px] md:h-[400px] lg:h-auto min-h-[350px] lg:min-h-[500px] p-8 md:p-4 lg:p-16 bg-slate-50/50">
              <iframe
                src="https://www.google.com/maps?q=17.5195056,78.3918841&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hyderabad Map"
                className="rounded-2xl border border-[#D4D4D4] w-full h-full min-h-[300px] md:min-h-[350px] lg:min-h-[450px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-center px-4 pb-16 sm:pb-20 md:pb-24 lg:pb-28">
        <div className="bg-white rounded-2xl sm:rounded-[16px] md:rounded-[20px] lg:rounded-[24px] shadow-lg max-w-5xl w-full border border-gray-50/50">
          <div className="max-w-2xl mx-auto px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14 md:py-16 lg:py-18 text-center">
            <h2 className="text-xl sm:text-2xl md:text-[30px] lg:text-[36px] font-bold text-[#2F3D43] mb-4">
              Let's get started on something great
            </h2>
            <p className="text-[#686D70] text-xs sm:text-sm md:text-[16px] lg:text-[18px] mb-8">
              Join over 4,000+ startups already growing with Untitled.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center bg-[#1B9EE0] hover:bg-[#1589b8] text-white font-medium text-sm sm:text-base md:text-[18px] lg:text-[20px] px-8 py-3 rounded-full transition-colors duration-200 shadow-md"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

