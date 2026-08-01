"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Lightbulb,
  Move3D,
  Palette,
  Rocket,
  Sparkles,
  TrendingUp,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type HeroBanner3DProps = {
  className?: string;
};

/** Parcours client — 6 faces, langage non technique. */
const JOURNEY_FACES = [
  "idea",
  "design",
  "build",
  "launch",
  "growth",
  "support",
] as const;

type JourneyFace = (typeof JOURNEY_FACES)[number];

const FACE_ICONS: Record<JourneyFace, LucideIcon> = {
  idea: Lightbulb,
  design: Palette,
  build: Sparkles,
  launch: Rocket,
  growth: TrendingUp,
  support: HeartHandshake,
};

const DRAG_SENSITIVITY = 0.55;
const DRAG_SENSITIVITY_COMPACT = 0.72;
const TILT_X = -14;
const TILT_X_COMPACT = -8;
const YAW_BIAS = 16;
const CUBE_BLEED_COMPACT = 0.7;
const CUBE_BLEED_DESKTOP = 0.86;
const IDLE_ADVANCE_MS = 4200;
const IDLE_RESUME_MS = 7000;

type FaceDef = {
  id: JourneyFace;
  normal: [number, number, number];
  transform: (half: number) => string;
  /** Orientation qui met la face face à la caméra. */
  pose: (tiltX: number) => { rx: number; ry: number };
};

const FACES: FaceDef[] = [
  {
    id: "idea",
    normal: [0, 0, 1],
    transform: (h) => `translateZ(${h}px)`,
    pose: (tiltX) => ({ rx: tiltX, ry: YAW_BIAS }),
  },
  {
    id: "design",
    normal: [1, 0, 0],
    transform: (h) => `rotateY(90deg) translateZ(${h}px)`,
    pose: (tiltX) => ({ rx: tiltX, ry: -90 + YAW_BIAS }),
  },
  {
    id: "build",
    normal: [0, 0, -1],
    transform: (h) => `rotateY(180deg) translateZ(${h}px)`,
    pose: (tiltX) => ({ rx: tiltX, ry: -180 + YAW_BIAS }),
  },
  {
    id: "launch",
    normal: [-1, 0, 0],
    transform: (h) => `rotateY(-90deg) translateZ(${h}px)`,
    pose: (tiltX) => ({ rx: tiltX, ry: 90 + YAW_BIAS }),
  },
  {
    id: "growth",
    normal: [0, 1, 0],
    transform: (h) => `rotateX(-90deg) translateZ(${h}px)`,
    pose: () => ({ rx: 90 - YAW_BIAS * 0.35, ry: YAW_BIAS }),
  },
  {
    id: "support",
    normal: [0, -1, 0],
    transform: (h) => `rotateX(90deg) translateZ(${h}px)`,
    pose: () => ({ rx: -90 + YAW_BIAS * 0.35, ry: YAW_BIAS }),
  },
];

function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/** rotateZ → rotateY → rotateX (ordre CSS). */
function rotateVector(x: number, y: number, z: number, rx: number, ry: number, rz: number) {
  const cz = Math.cos(degToRad(rz));
  const sz = Math.sin(degToRad(rz));
  const x1 = x * cz - y * sz;
  const y1 = x * sz + y * cz;
  const z1 = z;

  const cy = Math.cos(degToRad(ry));
  const sy = Math.sin(degToRad(ry));
  const x2 = x1 * cy + z1 * sy;
  const y2 = y1;
  const z2 = -x1 * sy + z1 * cy;

  const cx = Math.cos(degToRad(rx));
  const sx = Math.sin(degToRad(rx));
  return {
    x: x2,
    y: y2 * cx - z2 * sx,
    z: y2 * sx + z2 * cx,
  };
}

function getDominantFace(rx: number, ry: number, rz: number): JourneyFace {
  let bestZ = -Infinity;
  let best: JourneyFace = "idea";

  for (const face of FACES) {
    const n = rotateVector(
      face.normal[0],
      face.normal[1],
      face.normal[2],
      rx,
      ry,
      rz
    );
    if (n.z > bestZ) {
      bestZ = n.z;
      best = face.id;
    }
  }

  return best;
}

function shortestAngleDelta(from: number, to: number) {
  let delta = ((to - from + 540) % 360) - 180;
  if (delta < -180) delta += 360;
  return delta;
}

type CubeJourneyFaceProps = {
  size: number;
  transform: string;
  faceId: JourneyFace;
  title: string;
  active: boolean;
  Icon: LucideIcon;
};

function CubeJourneyFace({
  size,
  transform,
  faceId,
  title,
  active,
  Icon,
}: CubeJourneyFaceProps) {
  const iconSize = Math.max(18, Math.round(size * 0.14));
  const titleSize = Math.max(11, Math.round(size * 0.095));

  return (
    <div
      aria-hidden
      data-face={faceId}
      className={cn(
        "absolute left-0 top-0 flex flex-col items-center justify-center gap-2 overflow-hidden p-3 text-center [backface-visibility:hidden] transition-[box-shadow,border-color,background-color] duration-300",
        active
          ? "border-2 border-step-accent/70 bg-gradient-to-br from-step-surface via-card to-step-accent/35 shadow-[0_0_28px_-6px_var(--color-step-accent)]"
          : "border-2 border-step-accent/20 bg-gradient-to-br from-step-surface via-card to-step-accent/10"
      )}
      style={{ width: size, height: size, transform }}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border transition-colors duration-300",
          active
            ? "border-step-accent/50 bg-background/70 text-step-accent"
            : "border-step-accent/25 bg-background/50 text-foreground/55"
        )}
        style={{ width: iconSize * 1.85, height: iconSize * 1.85 }}
      >
        <Icon style={{ width: iconSize, height: iconSize }} strokeWidth={1.5} />
      </div>
      <span
        className={cn(
          "max-w-[90%] font-display-serif font-semibold leading-tight tracking-tight transition-colors duration-300",
          active ? "text-foreground" : "text-foreground/70"
        )}
        style={{ fontSize: titleSize }}
      >
        {title}
      </span>
      {active && (
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,var(--color-step-accent),transparent_62%)] opacity-20"
          aria-hidden
        />
      )}
    </div>
  );
}

export function HeroBanner3D({ className }: HeroBanner3DProps) {
  const t = useTranslations("heroCube");
  const cubeSizerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [cubeSize, setCubeSize] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const isCompactRef = useRef(false);
  const [activeFace, setActiveFace] = useState<JourneyFace>("idea");
  const activeFaceRef = useRef<JourneyFace>("idea");
  const userInteractedRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isInteractive = !reduceMotion;
  const tiltX = isCompact ? TILT_X_COMPACT : TILT_X;
  const tiltXRef = useRef(tiltX);
  tiltXRef.current = tiltX;

  const initialPose = FACES[0].pose(tiltX);
  const rotateX = useMotionValue(initialPose.rx);
  const rotateY = useMotionValue(initialPose.ry);
  const rotateZ = useMotionValue(0);

  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 });
  const velocity = useRef({ x: 0, y: 0, z: 0 });
  const inertiaFrame = useRef<number | null>(null);
  const activePointerId = useRef<number | null>(null);
  const dragListenersTarget = useRef<HTMLDivElement | null>(null);
  const lastPointer = useRef({ x: 0, y: 0 });
  const snapping = useRef(false);

  const stopInertia = useCallback(() => {
    if (inertiaFrame.current !== null) {
      cancelAnimationFrame(inertiaFrame.current);
      inertiaFrame.current = null;
    }
  }, []);

  const transform = useTransform(
    [rotateX, rotateY, rotateZ],
    ([x, y, z]) => `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`
  );

  const updateActiveFace = useCallback((face: JourneyFace) => {
    if (activeFaceRef.current === face) return;
    activeFaceRef.current = face;
    setActiveFace(face);
  }, []);

  const syncFaceFromRotation = useCallback(() => {
    const face = getDominantFace(rotateX.get(), rotateY.get(), rotateZ.get());
    updateActiveFace(face);
  }, [rotateX, rotateY, rotateZ, updateActiveFace]);

  useMotionValueEvent(rotateX, "change", syncFaceFromRotation);
  useMotionValueEvent(rotateY, "change", syncFaceFromRotation);
  useMotionValueEvent(rotateZ, "change", syncFaceFromRotation);

  const clearIdleTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const snapToFace = useCallback(
    (faceId: JourneyFace, opts?: { immediate?: boolean }) => {
      const face = FACES.find((f) => f.id === faceId);
      if (!face) return;

      stopInertia();
      snapping.current = true;

      const pose = face.pose(tiltXRef.current);
      const currentY = rotateY.get();
      const targetY = currentY + shortestAngleDelta(currentY, pose.ry);

      updateActiveFace(faceId);

      if (opts?.immediate || reduceMotion) {
        rotateX.set(pose.rx);
        rotateY.set(targetY);
        rotateZ.set(0);
        snapping.current = false;
        return;
      }

      animate(rotateX, pose.rx, {
        type: "spring",
        stiffness: 120,
        damping: 20,
      });
      animate(rotateY, targetY, {
        type: "spring",
        stiffness: 120,
        damping: 20,
      });
      animate(rotateZ, 0, {
        type: "spring",
        stiffness: 120,
        damping: 20,
        onComplete: () => {
          snapping.current = false;
        },
      });
    },
    [reduceMotion, rotateX, rotateY, rotateZ, stopInertia, updateActiveFace]
  );

  const scheduleIdleAdvance = useCallback(() => {
    if (reduceMotion || userInteractedRef.current) return;
    clearIdleTimers();

    advanceTimerRef.current = setTimeout(() => {
      if (dragging.current || snapping.current) {
        scheduleIdleAdvance();
        return;
      }
      const idx = JOURNEY_FACES.indexOf(activeFaceRef.current);
      const next = JOURNEY_FACES[(idx + 1) % JOURNEY_FACES.length];
      snapToFace(next);
      scheduleIdleAdvance();
    }, IDLE_ADVANCE_MS);
  }, [clearIdleTimers, reduceMotion, snapToFace]);

  const markInteracted = useCallback(() => {
    userInteractedRef.current = true;
    clearIdleTimers();
    idleTimerRef.current = setTimeout(() => {
      userInteractedRef.current = false;
      scheduleIdleAdvance();
    }, IDLE_RESUME_MS);
  }, [clearIdleTimers, scheduleIdleAdvance]);

  useEffect(() => {
    const el = cubeSizerRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const bleed = isCompact ? CUBE_BLEED_COMPACT : CUBE_BLEED_DESKTOP;
      const nextSize = Math.min(width, height) * bleed;
      setCubeSize((prev) => (Math.abs(prev - nextSize) < 0.5 ? prev : nextSize));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isCompact]);

  useEffect(() => {
    const compactMq = window.matchMedia("(max-width: 639px)");
    const update = () => {
      const compact = compactMq.matches;
      setIsCompact(compact);
      isCompactRef.current = compact;
    };
    update();
    compactMq.addEventListener("change", update);
    return () => compactMq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (dragging.current || snapping.current) return;
    const face = FACES.find((f) => f.id === activeFaceRef.current) ?? FACES[0];
    const pose = face.pose(tiltX);
    rotateX.set(pose.rx);
  }, [tiltX, rotateX]);

  useEffect(() => {
    scheduleIdleAdvance();
    return () => {
      clearIdleTimers();
      stopInertia();
      detachDragListeners();
    };
    // Mount / unmount only — timers + listeners cleaned via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function detachDragListeners() {
    const target = dragListenersTarget.current;
    if (!target) return;
    target.removeEventListener("pointermove", onPointerMove);
    target.removeEventListener("pointerup", onPointerUp);
    target.removeEventListener("pointercancel", onPointerUp);
    dragListenersTarget.current = null;
  }

  function snapToDominantFace() {
    const face = getDominantFace(rotateX.get(), rotateY.get(), rotateZ.get());
    snapToFace(face);
  }

  function startInertia() {
    stopInertia();

    let vx = velocity.current.x;
    let vy = velocity.current.y;
    let vz = velocity.current.z;

    const step = () => {
      if (Math.abs(vx) < 0.035 && Math.abs(vy) < 0.035 && Math.abs(vz) < 0.035) {
        inertiaFrame.current = null;
        snapToDominantFace();
        return;
      }

      rotateY.set(rotateY.get() + vx);
      rotateX.set(rotateX.get() + vy);
      rotateZ.set(rotateZ.get() + vz);

      vx *= 0.9;
      vy *= 0.9;
      vz *= 0.9;

      inertiaFrame.current = requestAnimationFrame(step);
    };

    inertiaFrame.current = requestAnimationFrame(step);
  }

  function getDragSensitivity() {
    return isCompactRef.current ? DRAG_SENSITIVITY_COMPACT : DRAG_SENSITIVITY;
  }

  function onPointerMove(event: PointerEvent) {
    if (!dragging.current || activePointerId.current !== event.pointerId) return;
    event.preventDefault();

    const sensitivity = getDragSensitivity();
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;

    if (event.shiftKey) {
      rotateZ.set(dragStart.current.rotateZ + dx * sensitivity);
    } else {
      rotateY.set(dragStart.current.rotateY + dx * sensitivity);
      rotateX.set(dragStart.current.rotateX - dy * sensitivity);
    }

    const mx =
      event.movementX !== 0 ? event.movementX : event.clientX - lastPointer.current.x;
    const my =
      event.movementY !== 0 ? event.movementY : event.clientY - lastPointer.current.y;

    lastPointer.current = { x: event.clientX, y: event.clientY };
    velocity.current = {
      x: mx * sensitivity,
      y: -my * sensitivity,
      z: event.shiftKey ? mx * sensitivity : 0,
    };
  }

  function onPointerUp(event: PointerEvent) {
    if (activePointerId.current !== event.pointerId) return;

    dragging.current = false;
    activePointerId.current = null;

    const target = dragListenersTarget.current;
    if (target?.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    target?.classList.remove("cursor-grabbing");
    target?.classList.add("cursor-grab");
    detachDragListeners();

    const speed =
      Math.abs(velocity.current.x) +
      Math.abs(velocity.current.y) +
      Math.abs(velocity.current.z);

    if (speed > 0.4) {
      startInertia();
    } else {
      snapToDominantFace();
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!isInteractive) return;
    if ((event.target as HTMLElement).closest("[data-stage-control]")) return;

    event.preventDefault();
    markInteracted();
    stopInertia();
    snapping.current = false;

    const target = event.currentTarget;
    dragging.current = true;
    activePointerId.current = event.pointerId;
    dragListenersTarget.current = target;
    lastPointer.current = { x: event.clientX, y: event.clientY };

    target.setPointerCapture(event.pointerId);
    target.classList.remove("cursor-grab");
    target.classList.add("cursor-grabbing");

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      rotateX: rotateX.get(),
      rotateY: rotateY.get(),
      rotateZ: rotateZ.get(),
    };
    velocity.current = { x: 0, y: 0, z: 0 };

    const passiveOpts = { passive: false } as const;
    target.addEventListener("pointermove", onPointerMove, passiveOpts);
    target.addEventListener("pointerup", onPointerUp, passiveOpts);
    target.addEventListener("pointercancel", onPointerUp, passiveOpts);
  }

  function goToFace(faceId: JourneyFace) {
    markInteracted();
    snapToFace(faceId);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const idx = JOURNEY_FACES.indexOf(activeFace);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      goToFace(JOURNEY_FACES[(idx + 1) % JOURNEY_FACES.length]);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      goToFace(JOURNEY_FACES[(idx - 1 + JOURNEY_FACES.length) % JOURNEY_FACES.length]);
    } else if (event.key === "Home") {
      event.preventDefault();
      goToFace("idea");
    } else if (event.key === "End") {
      event.preventDefault();
      goToFace("support");
    }
  }

  const half = cubeSize / 2;
  const ready = cubeSize > 0;
  const stepIndex = JOURNEY_FACES.indexOf(activeFace) + 1;
  const liveCaption = `${t(`stages.${activeFace}.title`)}. ${t(`stages.${activeFace}.desc`)}`;

  return (
    <div
      className={cn(
        "relative w-full select-none overflow-visible px-1 py-2 sm:px-3 sm:py-6",
        className
      )}
    >
      {!reduceMotion && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,var(--color-step-accent),transparent_62%)] opacity-20 blur-3xl"
        />
      )}

      <p className="mb-3 text-center text-[0.65rem] font-medium uppercase tracking-[0.2em] text-step-accent/90 sm:mb-4 sm:text-xs">
        {t("storyLabel")}
      </p>

      <div className="relative mx-auto aspect-square w-full max-w-[min(100%,15rem)] overflow-visible sm:max-w-none sm:aspect-[16/11] [perspective:1000px]">
        <div
          ref={cubeSizerRef}
          className={cn(
            "absolute inset-[4%] flex items-center justify-center sm:inset-[6%]",
            isInteractive && "touch-none cursor-grab active:cursor-grabbing"
          )}
          style={isInteractive ? { touchAction: "none" } : undefined}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          role="group"
          tabIndex={0}
          aria-roledescription={t("roleDescription")}
          aria-label={t("ariaLabel")}
          aria-describedby="hero-cube-caption"
        >
          {ready && (
            <motion.div
              className="relative will-change-transform [transform-style:preserve-3d]"
              style={{
                width: cubeSize,
                height: cubeSize,
                transform: reduceMotion
                  ? `rotateX(${FACES.find((f) => f.id === activeFace)!.pose(tiltX).rx}deg) rotateY(${FACES.find((f) => f.id === activeFace)!.pose(tiltX).ry}deg)`
                  : transform,
              }}
            >
              {FACES.map((face) => {
                const Icon = FACE_ICONS[face.id];
                return (
                  <CubeJourneyFace
                    key={face.id}
                    size={cubeSize}
                    transform={face.transform(half)}
                    faceId={face.id}
                    title={t(`stages.${face.id}.title`)}
                    active={activeFace === face.id}
                    Icon={Icon}
                  />
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      <div
        id="hero-cube-caption"
        className="mx-auto mt-4 min-h-[5.5rem] max-w-sm text-center sm:mt-5 sm:min-h-[5rem]"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFace}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-foreground/40">
              {t("stepLabel", { current: stepIndex, total: JOURNEY_FACES.length })}
            </p>
            <p className="mt-1.5 font-display-serif text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {t(`stages.${activeFace}.title`)}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
              {t(`stages.${activeFace}.desc`)}
            </p>
            <span className="sr-only">{liveCaption}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        data-stage-control
        className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:mt-5"
        role="tablist"
        aria-label={t("stagesNavLabel")}
      >
        {JOURNEY_FACES.map((faceId) => {
          const selected = activeFace === faceId;
          return (
            <button
              key={faceId}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={t(`stages.${faceId}.title`)}
              data-stage-control
              onClick={() => goToFace(faceId)}
              className={cn(
                "min-h-11 min-w-11 rounded-full px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "flex items-center justify-center"
              )}
            >
              <span
                className={cn(
                  "block rounded-full transition-all duration-300",
                  selected
                    ? "h-2 w-6 bg-step-accent"
                    : "h-2 w-2 bg-foreground/25 hover:bg-foreground/45"
                )}
              />
            </button>
          );
        })}
      </div>

      {isInteractive && (
        <p className="mx-auto mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-foreground/40 sm:text-sm">
          <Move3D className="size-3.5 shrink-0 opacity-70" aria-hidden />
          <span>{t("dragHint")}</span>
        </p>
      )}
    </div>
  );
}
