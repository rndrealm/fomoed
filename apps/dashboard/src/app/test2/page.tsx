"use client";
import React, { useRef } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { Button } from "@/components/ui/button";

const Page = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const speak = () => {
    if (typeof window !== "undefined") {
      const utterance = new SpeechSynthesisUtterance(textRef.current?.textContent || "");
      window.speechSynthesis.speak(utterance);
    }
  };
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="mx-auto w-[450px] text-white" ref={textRef}>
        {/* It's been thirty years since Linus Torvalds created Linux. There are many reasons why folks switch to Linux.
        While attending college, Lisa Seelye couldn't afford a Windows license. She worked in a bookstore where she got
        a nice discount on Red Hat Linux 5.2. Twenty years later, she is working at Red Hat. The responses were varied.
        Here are 17 true stories from our community. What is your Linux story? We learned the origin stories of
        twenty-four open source technologists by asking them what their first programming language was. The answers were
        as varied as you would expect. They ranged from BASIC, Fortran, Python, Scratch, Logo, and many more. Greg
        Pittman said, "After switching to Linux, my next language was Perl, which oddly enough seemed like a fairly easy
        transition from BASIC. After Perl, came Python, a language less stiff with syntax." Our most popular interview
        was with Jim Hall, the founder of FreeDOS. Jim created FreeDOS in response to Microsoft ending support for
        MS-DOS in 1994. Jim said, "I heard that Microsoft planned to "do away" with MS-DOS. The next version of Windows
        would eliminate DOS. I didn't like that, and I still wanted to run DOS. I decided that if folks could come
        together over the Internet to write something like Linux, surely, we could do the same with DOS. After all, DOS
        was fairly simple compared to Linux." Joshua Allen Holm and I collaborated on this interview that celebrated how
        Jim founded a free and open source operating system as a college student. */}
      </div>
      <Button onClick={speak} className="mt-4">
        Speak
      </Button>
    </div>
  );
};

export default Page;
