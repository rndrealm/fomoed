import React from "react";

interface Iprops {
  scrollToSection: (id: string) => void;
  sections: {
    id: string;
    label: string;
  }[];
  activeSection: string;
}

const TermsPanel = (props: Iprops) => {
  return (
    <div className="sticky top-8">
      <nav className="rounded-lg bg-[#0A0A0A] p-4">
        <ul className="space-y-2">
          {props.sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => props.scrollToSection(section.id)}
                className={`w-full text-left text-[14px] font-inter transition-colors ${
                  props.activeSection === section.id ? "text-white font-medium" : "text-[#888888] hover:text-gray-300"
                }`}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TermsPanel;
