"use client";

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  PROJECT_INQUIRY_BRANCH,
  PROJECT_INQUIRY_CONSTELLATION_NODES,
  type ProjectInquiryType,
} from "@/data/project-inquiry-options";

type NodeState = "future" | "current" | "completed";

type ProjectConstellationProps = {
  /** Nombre de nœuds complétés. */
  completedCount: number;
  /** Index du nœud courant, ou null si hors parcours questions. */
  currentIndex: number | null;
  projectType?: ProjectInquiryType | null;
  className?: string;
  /** Label accessible, ex. « Étape 3 sur 6 — Budget ». */
  ariaLabel: string;
  /** Nombre d’étoiles (parcours de base = 6, offre = 5). */
  nodeCount?: number;
};

/** Positions de base (viewBox 320×120). */
const BASE_NODES: Array<{ x: number; y: number }> = [
  { x: 28, y: 72 },
  { x: 78, y: 42 },
  { x: 128, y: 78 },
  { x: 178, y: 38 },
  { x: 228, y: 70 },
  { x: 282, y: 48 },
];

function layoutNodes(count: number): Array<{ x: number; y: number }> {
  if (count >= BASE_NODES.length) return BASE_NODES;
  const start = 36;
  const end = 284;
  const ys = [68, 42, 78, 40, 62];
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    return {
      x: start + (end - start) * t,
      y: ys[i] ?? 55,
    };
  });
}

function branchOffset(
  branch: "a" | "b" | "c" | "d" | "e",
  index: number
): { x: number; y: number } {
  const wave =
    branch === "a"
      ? 0
      : branch === "b"
        ? Math.sin(index) * 8
        : branch === "c"
          ? Math.cos(index) * 10
          : branch === "d"
            ? (index % 2 === 0 ? -6 : 6)
            : Math.sin(index * 1.3) * 5;
  return { x: 0, y: wave };
}

export function ProjectConstellation({
  completedCount,
  currentIndex,
  projectType,
  className,
  ariaLabel,
  rtl = false,
  nodeCount = PROJECT_INQUIRY_CONSTELLATION_NODES.length,
}: ProjectConstellationProps & { rtl?: boolean }) {
  const reduceMotion = useReducedMotion();
  const branch = projectType
    ? PROJECT_INQUIRY_BRANCH[projectType]
    : "a";

  const nodes = useMemo(
    () =>
      layoutNodes(nodeCount).map((n, i) => {
        const o = branchOffset(branch, i);
        return { x: n.x + o.x, y: n.y + o.y };
      }),
    [branch, nodeCount]
  );

  const states: NodeState[] = nodes.map((_, i) => {
    if (i < completedCount) return "completed";
    if (currentIndex === i) return "current";
    return "future";
  });

  return (
    <div
      className={cn("w-full min-w-0 px-1 sm:px-0", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox="0 14 320 92"
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          "mx-auto block h-auto w-full max-w-lg",
          rtl && "-scale-x-100"
        )}
        fill="none"
        aria-hidden
      >
        {nodes.slice(0, -1).map((from, i) => {
          const to = nodes[i + 1]!;
          const active = i < completedCount;
          const length = Math.hypot(to.x - from.x, to.y - from.y);
          return (
            <line
              key={`line-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={
                active
                  ? "rgba(201,169,106,0.55)"
                  : "rgba(244,241,232,0.08)"
              }
              strokeWidth={active ? 1.25 : 1}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={
                active && !reduceMotion
                  ? {
                      strokeDasharray: length,
                      strokeDashoffset: 0,
                      transition: "stroke 0.35s ease, stroke-dashoffset 0.45s ease",
                    }
                  : undefined
              }
            />
          );
        })}

        {nodes.map((node, i) => {
          const state = states[i] ?? "future";
          const r =
            state === "completed" ? 5.25 : state === "current" ? 6 : 4;
          const fill =
            state === "completed"
              ? "#C9A96A"
              : state === "current"
                ? "#F4F1E8"
                : "rgba(139,147,167,0.35)";
          const stroke =
            state === "current"
              ? "rgba(201,169,106,0.7)"
              : state === "completed"
                ? "rgba(229,201,143,0.5)"
                : "transparent";

          return (
            <g key={`node-${i}`}>
              {state === "current" || state === "completed" ? (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r + 7}
                  fill="rgba(201,169,106,0.08)"
                />
              ) : null}
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={1.25}
                vectorEffect="non-scaling-stroke"
                style={
                  reduceMotion
                    ? undefined
                    : { transition: "r 0.25s ease, fill 0.25s ease" }
                }
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function constellationIndexForStep(
  step: string,
  nodes: readonly string[] = PROJECT_INQUIRY_CONSTELLATION_NODES
): number | null {
  const idx = nodes.indexOf(step);
  return idx >= 0 ? idx : null;
}
