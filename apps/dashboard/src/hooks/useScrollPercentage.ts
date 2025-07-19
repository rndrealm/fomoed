import { useState, useEffect } from "react";

/**
 * Custom hook to track scroll percentage of the page
 * @returns number between 0-100 representing the scroll percentage
 */
export const useScrollPercentage = () => {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      console.log("Scroll event triggered");
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      console.log("Scroll data:", { scrollTop, docHeight, scrollPercent });
      setScrollPercentage(Math.min(Math.max(scrollPercent, 0), 100));
    };

    // Debug: Check if page is scrollable
    const pageInfo = {
      windowHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.scrollHeight,
      isScrollable: document.documentElement.scrollHeight > window.innerHeight,
      // Check CSS overflow properties
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      bodyOverflow: getComputedStyle(document.body).overflow,
      htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
      bodyOverflowY: getComputedStyle(document.body).overflowY,
    };

    console.log("Page scroll info:", pageInfo);

    // If not scrollable, log potential solutions
    if (!pageInfo.isScrollable) {
      console.warn("⚠️ Page is not scrollable. Potential issues:");
      console.warn("1. Content height <= window height");
      console.warn("2. CSS overflow might be set to 'hidden'");
      console.warn("3. Check if content is properly sized");

      // Force some content for testing
      console.log("💡 Try adding more content or check CSS overflow properties");
    }

    // Set initial scroll percentage
    handleScroll();

    // Only add scroll listeners if page is scrollable
    if (pageInfo.isScrollable) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      console.log("Skipping scroll listener - page not scrollable");
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPercentage;
};
