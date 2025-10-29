"use client";
import Acceptance from "@/components/terms-of-service/acceptance";
import AccountAndData from "@/components/terms-of-service/account-and-data";
import ContactInformation from "@/components/terms-of-service/contact-information";
import Disclaimer from "@/components/terms-of-service/disclaimer";
import GoverningLaws from "@/components/terms-of-service/governing-laws";
import Indemnification from "@/components/terms-of-service/indemnification";
import LimitationOfLiability from "@/components/terms-of-service/limitation-of-liability";
import TermsPanel from "@/components/terms-of-service/panel";
import ProperUse from "@/components/terms-of-service/proper-use";
import Termination from "@/components/terms-of-service/termination";
import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState("agreement");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sections = [
    { id: "agreement", label: "Agreement to Terms." },
    { id: "acceptance", label: "Acceptance." },
    { id: "account", label: "Account and Data." },
    { id: "disclaimer", label: "Disclaimer." },
    { id: "limitation", label: "Limitation of Liability." },
    { id: "indemnification", label: "Indemnification." },
    { id: "termination", label: "Termination." },
    { id: "proper-use", label: "Proper Use." },
    { id: "governing-laws", label: "Governing Laws and Dispute Resolution." },
    { id: "contact", label: "Contact Information." },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-12">
        <a
          href="/dashboard"
          className="font-inter inline-flex items-center gap-2 mb-8 text-[14px] text-[#888888] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </a>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h1 className="text-[40px] font-medium text-white font-inter">Terms of Service</h1>
            <p className="mt-[18px] mb-8 text-[14px] font-medium text-[#888888] font-inter">
              Last Updated Oct 21, 2025
            </p>

            <div className="space-y-8">
              <section id="agreement">
                <p className="text-[14px] font-normal text-[#D1D1D1] font-inter">
                  These Terms and Conditions (&quot;Terms&quot;) govern your use of Fomoed Terminal and related
                  services. By accessing or using Fomoed, you agree to be bound by these Terms. Fomoed reserves the
                  right to update these Terms at any time, with changes posted on our platform.
                </p>
              </section>

              <section id="acceptance">
                <Acceptance />
              </section>

              <section id="account">
                <AccountAndData />
              </section>

              <section id="disclaimer">
                <Disclaimer />
              </section>

              <section id="limitation">
                <LimitationOfLiability />
              </section>

              <section id="indemnification">
                <Indemnification />
              </section>

              <section id="termination">
                <Termination />
              </section>

              <section id="proper-use">
                <ProperUse />
              </section>

              <section id="governing-laws">
                <GoverningLaws />
              </section>

              <section id="contact">
                <ContactInformation />
              </section>
            </div>
          </div>

          <div className="lg:col-span-4">
            <TermsPanel scrollToSection={scrollToSection} sections={sections} activeSection={activeSection} />
          </div>
        </div>
      </div>
    </div>
  );
}
