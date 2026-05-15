import { useEffect, useRef } from "react";

function Analytics() {
  const renderCount = useRef(0);
  const renderCountElement = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    renderCount.current += 1;

    if (renderCountElement.current) {
      renderCountElement.current.textContent = String(renderCount.current);
    }

    console.log("Analytics render:", renderCount.current);
  });

  return (
    <>
      <p>Analytics</p>

      <p>
        Количество ререндеров: <span ref={renderCountElement}>0</span>
      </p>
    </>
  );
}

export default Analytics;
