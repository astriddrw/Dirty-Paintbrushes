"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function IntroAnimation() {
  const [phase, setPhase] = useState<"logo" | "text" | "exit" | "done">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 800);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(() => setPhase("done"), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      {(phase === "logo" || phase === "text" || phase === "exit") && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-foreground origin-top"
            initial={{ scaleY: 1 }}
            animate={phase === "exit" ? { scaleY: 0 } : { scaleY: 1 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-foreground origin-bottom"
            initial={{ scaleY: 1 }}
            animate={phase === "exit" ? { scaleY: 0 } : { scaleY: 1 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
              className="w-20 h-20 relative"
            >
              <Image src="/logo.jpg" alt="Dirty Paintbrushes logo" fill className="object-contain" priority />
            </motion.div>

            <div className="overflow-hidden">
              <motion.p
                className="text-background text-sm font-medium tracking-[0.35em] uppercase"
                initial={{ y: "100%" }}
                animate={phase === "text" || phase === "exit" ? { y: "0%" } : { y: "100%" }}
                transition={{ duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
              >
                Dirty Paintbrushes
              </motion.p>
            </div>

            <div className="overflow-hidden">
              <motion.p
                className="text-background/50 text-xs font-medium tracking-[0.25em] uppercase"
                initial={{ y: "100%" }}
                animate={phase === "text" || phase === "exit" ? { y: "0%" } : { y: "100%" }}
                transition={{ duration: 0.55, ease: [0.33, 1, 0.68, 1], delay: 0.07 }}
              >
                Art Market Financial Crime Intelligence
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
