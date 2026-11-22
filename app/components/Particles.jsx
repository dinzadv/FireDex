import React, { useEffect, useRef } from "react";
export function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, g = cv.getContext("2d");
    let list = [], raf = 0;
    const init = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
      const n = Math.min(70, Math.floor(window.innerWidth * window.innerHeight / 24e3));
      list = Array.from({ length: n }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, r: Math.random() * 1.5 + 0.6, vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12, o: Math.random() * 0.4 + 0.1 }));
    };
    const tick = () => {
      g.clearRect(0, 0, cv.width, cv.height);
      for (const p of list) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = cv.width;
        if (p.x > cv.width) p.x = 0;
        if (p.y < 0) p.y = cv.height;
        if (p.y > cv.height) p.y = 0;
        g.beginPath();
        g.fillStyle = "rgba(133,119,248," + p.o + ")";
        g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        g.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    init();
    tick();
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init);
    };
  }, []);
  return <canvas id="particles" ref={ref} />;
}
