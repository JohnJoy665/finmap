import { useState } from "react";

function useIsMobile() {
  const [isMobile] = useState(() => {
    console.log("calculate isMobile");
    if (typeof window === "undefined") return false;

    return window.innerWidth < 900;
  });

  return { isMobile };
}

export default useIsMobile;
