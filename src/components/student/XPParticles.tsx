import { motion } from "motion/react";
import { useEffect } from "react";

interface XPParticlesProps {
  onComplete: () => void;
  amount: number;
}

export function XPParticles({ onComplete, amount }: XPParticlesProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate particles
  const particles = Array.from({ length: 30 }).map((_, i) => {
      const angle = (i / 30) * 360;
      const velocity = 100 + Math.random() * 100;
      return {
          id: i,
          x: Math.cos(angle * (Math.PI / 180)) * velocity,
          y: Math.sin(angle * (Math.PI / 180)) * velocity,
          color: i % 2 === 0 ? "#FFD700" : "#4ADE80", // Gold and Green
          delay: Math.random() * 0.2
      }
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: p.delay }}
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }}
        />
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1.2, y: -50 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-2xl"
        style={{ 
            textShadow: '2px 2px 0px black, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
        }}
      >
        +{amount} XP
      </motion.div>
    </div>
  );
}
