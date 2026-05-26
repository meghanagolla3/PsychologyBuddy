'use client';

import TermsAndConditions from "@/components/LandingPage/Pages/Terms/TermsAndConditions";
import Footer from "@/components/LandingPage/sections/Footer";
import Navigation from "@/components/LandingPage/components/Navigation";



export default function Home() {
  return (
    <>
    <Navigation/>
        <TermsAndConditions/>
        <Footer/>
    </>
  );
}
