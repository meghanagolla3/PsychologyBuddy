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
      <div className="relative w-full h-[190px] sm:h-[260px] md:h-[300px] bg-gradient-to-b from-[#1f94ce] to-[#1e8cc6] overflow-hidden">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-16 py-6 sm:py-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {/* Chat to sales */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 flex items-start gap-2 sm:gap-4 shadow-sm border border-gray-100/50">
            <div className="rounded-full bg-[#e8f6fd] flex items-center justify-center flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 overflow-hidden">
              <Image 
                src="/contact/1.svg" 
                alt="Chat to sales" 
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-[#2F3D43] text-[11px] sm:text-[16px] leading-tight">Chat to sales</p>
              <p className="text-[#767676] text-[9px] sm:text-[13px] leading-normal mb-0.5">Speak to our team.</p>
              <p className="text-[#686D70] text-[8px] sm:text-[12px] font-medium break-all leading-none">support@abhyaas.in</p>
            </div>
          </div>

          {/* Call us */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 flex items-start gap-2 sm:gap-4 shadow-sm border border-gray-100/50">
            <div className="rounded-full bg-[#e8f6fd] flex items-center justify-center flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 overflow-hidden">
              <Image 
                src="/contact/2.svg" 
                alt="Call us" 
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-[#2F3D43] text-[11px] sm:text-[16px] leading-tight">Call us</p>
              <p className="text-[#767676] text-[9px] sm:text-[13px] leading-normal mb-0.5">Mon-Fri 9am to 5pm.</p>
              <p className="text-[#686D70] text-[8px] sm:text-[12px] font-medium leading-none">+91+ 8790778111</p>
            </div>
          </div>

          {/* Visit us */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 flex items-start gap-2 sm:gap-4 shadow-sm border border-gray-100/50 col-span-1">
            <div className="rounded-full bg-[#e8f6fd] flex items-center justify-center flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 overflow-hidden">
              <Image 
                src="/contact/3.svg" 
                alt="Visit us" 
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-[#2F3D43] text-[11px] sm:text-[16px] leading-tight">Visit us</p>
              <p className="text-[#767676] text-[9px] sm:text-[13px] leading-normal mb-0.5">Visit our office HQ.</p>
              <p className="text-[#686D70] text-[8px] sm:text-[12px] font-medium leading-none">PragatiNagar, Hyderabad</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form + Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-16 pb-12 sm:pb-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Form */}
            <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center items-center text-center">
              <p className="text-[#1B9EE0] text-xs sm:text-[16px] font-semibold mb-1">Contact us</p>
              <h2 className="text-2xl sm:text-3xl md:text-[36px] font-bold text-[#2F3D43] mb-1.5">Get in touch</h2>
              <p className="text-[#686D70] text-sm sm:text-base md:text-[20px] mb-6 sm:mb-8 leading-relaxed max-w-md">
                We'd love to hear from you. Please fill out this form.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 w-full text-left">
                <div>
                  <label className="block text-xs sm:text-[14px] font-medium text-[#344054] mb-1">First full name</label>
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
                  <label className="block text-xs sm:text-[14px] font-medium text-[#344054] mb-1">School/Institution Name</label>
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
                  <label className="block text-xs sm:text-[14px] font-medium text-[#344054] mb-1">Email ID</label>
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
                  <label className="block text-xs sm:text-[14px] font-medium text-[#344054] mb-1">Phone number</label>
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
                  <label className="block text-xs sm:text-[14px] font-medium text-[#344054] mb-1">Message</label>
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
                    className="w-4 h-4 mt-1 accent-[#1B9EE0]"
                  />
                  <label htmlFor="agree" className="text-xs sm:text-sm md:text-[16px] text-[#667085] leading-normal">
                    You agree to our friendly{" "}
                    <Link href="#" className="text-[#1a9fd4] underline">privacy policy</Link>.
                  </label>
                </div>

                {submitStatus === "success" && (
                  <div className="p-3.5 rounded-xl bg-green-50 text-green-700 text-xs sm:text-sm border border-green-200 font-medium">
                    ✓ Your message has been sent successfully. We'll get back to you soon!
                  </div>
                )}
                {submitStatus === "error" && (
                  <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs sm:text-sm border border-red-200 font-medium font-sans">
                    ⚠ {errorMessage || "Failed to send message. Please try again."}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1B9EE0] hover:bg-[#1589b8] disabled:bg-[#1B9EE0]/60 text-white font-semibold text-sm sm:text-[16px] py-2.5 sm:py-3 rounded-xl sm:rounded-[16px] transition-colors duration-200 flex items-center justify-center gap-2"
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
            <div className="h-[300px] lg:h-auto min-h-[300px] lg:min-h-[450px] p-6 lg:p-16 bg-slate-50/50">
              <iframe
                src="https://www.google.com/maps?q=17.5195056,78.3918841&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hyderabad Map"
                className="rounded-2xl border border-[#D4D4D4] w-full h-full min-h-[250px] lg:min-h-[350px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-center px-4 pb-12 sm:pb-16">
        <div className="bg-white rounded-2xl sm:rounded-[16px] shadow-lg max-w-5xl w-full border border-gray-50/50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-center">
            <h2 className="text-xl sm:text-2xl md:text-[30px] font-bold text-[#2F3D43] mb-3">
              Let's get started on something great
            </h2>
            <p className="text-[#686D70] text-xs sm:text-sm md:text-[16px] mb-6">
              Join over 4,000+ startups already growing with Untitled.
            </p>
            <Link
              href="#"
              className="inline-flex items-center bg-[#1B9EE0] hover:bg-[#1589b8] text-white font-medium text-sm sm:text-[16px] px-6 py-2.5 rounded-full transition-colors duration-200 shadow-md"
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