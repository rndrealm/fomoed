import { useRef, useState } from "react";

export function useTextToSpeech() {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const speak = (text: string) => {
    if (!synth || !text) return;
    if (synth.speaking) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  const pause = () => {
    if (synth?.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true); // immediate UI feedback
    }
  };

  const resume = () => {
    if (synth?.paused) {
      synth.resume();
      setIsPaused(false); // immediate UI feedback
    }
  };

  const cancel = () => {
    synth?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return {
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
  };
}
