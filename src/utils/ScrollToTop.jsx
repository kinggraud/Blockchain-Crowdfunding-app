import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Reset standard global window layout context
    window.scrollTo(0, 0);

    // 2. Direct hit targeting for the application layout framework wrapper
    const mainContentContainer = document.getElementById("main-scroll-container");

    if (mainContentContainer) {
      // Instantly resets the internal element scroll parameter context right back to 0
      mainContentContainer.scrollTo(0, 0);
      mainContentContainer.scrollTop = 0; 
    }
  }, [pathname]); // Fires instantly every single time you navigate routes

  return null;
};

export default ScrollToTop;