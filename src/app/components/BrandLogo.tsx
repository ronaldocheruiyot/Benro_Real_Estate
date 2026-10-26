import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import logoImage from "../../../assets/benro-logo.png";

interface BrandLogoProps {
  compact?: boolean;
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const rotateX = useSpring(useTransform(pointerY, [0, 100], [4, -4]), {
    stiffness: 180,
    damping: 22,
    mass: 0.7,
  });
  const rotateY = useSpring(useTransform(pointerX, [0, 100], [-5, 5]), {
    stiffness: 180,
    damping: 22,
    mass: 0.7,
  });
  const highlight = useMotionTemplate`radial-gradient(circle at ${pointerX}% ${pointerY}%, rgb(255 255 255 / 0.42), transparent 42%)`;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width) * 100);
    pointerY.set(((event.clientY - bounds.top) / bounds.height) * 100);
  };

  const handlePointerLeave = () => {
    pointerX.set(50);
    pointerY.set(50);
  };

  if (compact) {
    return (
      <motion.img
        src={logoImage}
        alt="BENRO Real Estates Ltd"
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto w-44 object-contain"
      />
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative z-10 flex max-w-xl flex-col items-center px-12 text-center"
    >
      <div
        className="relative flex size-96 items-center justify-center"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-5 rounded-full border border-brand-cyan/20"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-1 left-1/2 size-3 -translate-x-1/2 rounded-full bg-brand-lime shadow-lg shadow-brand-lime/40" />
          <div className="absolute bottom-10 left-5 size-2 rounded-full bg-brand-cyan" />
        </motion.div>
        <motion.div
          aria-hidden="true"
          className="absolute inset-14 rounded-full border border-dashed border-white/15"
          animate={reduceMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28, rotateX: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            opacity: { duration: 0.65, delay: 0.15 },
            y: { type: "spring", stiffness: 130, damping: 18, mass: 0.9, delay: 0.15 },
          }}
          style={{
            rotateX: reduceMotion ? 0 : rotateX,
            rotateY: reduceMotion ? 0 : rotateY,
            transformPerspective: 900,
          }}
          className="relative flex w-80 transform-gpu items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-white/95 px-7 py-8 shadow-2xl shadow-black/30 backdrop-blur"
        >
          <div className="absolute inset-x-10 -bottom-6 h-12 rounded-full bg-brand-cyan/25 blur-2xl" />
          <img
            src={logoImage}
            alt="BENRO Real Estates Ltd"
            className="relative w-full object-contain"
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: reduceMotion ? "none" : highlight }}
          />
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="absolute left-4 top-20 size-14 rotate-12 rounded-2xl border border-brand-cyan/25 bg-brand-cyan/10 backdrop-blur-sm"
          animate={reduceMotion ? undefined : { y: [0, -8, 0], rotate: [12, 15, 12] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-16 right-2 size-11 -rotate-12 rounded-full border border-brand-lime/35 bg-brand-lime/10"
          animate={reduceMotion ? undefined : { y: [0, 6, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
        className="-mt-4 space-y-3"
      >
        <div className="text-2xl font-medium tracking-tight text-white">
          Property management, simplified.
        </div>
        <p className="mx-auto max-w-md text-sm leading-6 text-cyan-50/70">
          One secure workspace for properties, tenants, payments, and your entire team.
        </p>
      </motion.div>
    </motion.div>
  );
}
