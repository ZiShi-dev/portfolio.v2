"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HERO_ARTWORK } from "@/lib/hero-artwork";

gsap.registerPlugin(useGSAP);

type HeroDepthFieldProps = {
  onLive: () => void;
  onFallback: () => void;
};

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uColor;
uniform sampler2D uDepth;
uniform vec2 uPointer;
uniform vec2 uCoverScale;
uniform vec2 uCoverOffset;
uniform float uScroll;
uniform float uTime;

void main() {
  vec2 uv = vec2(
    vUv.x * uCoverScale.x + uCoverOffset.x,
    1.0 - ((1.0 - vUv.y) * uCoverScale.y + uCoverOffset.y)
  );
  vec4 map = texture2D(uDepth, uv);
  float depth = map.r;
  vec2 shift = uPointer * depth * 0.02;
  shift.y -= uScroll * depth * 0.016;
  shift.x += sin(uTime * 0.31) * depth * 0.0055;
  shift.y += sin(uTime * 0.23) * depth * 0.0035;
  vec4 color = texture2D(uColor, clamp(uv - shift, 0.002, 0.998));
  float twinkle = 0.7 + 0.3 * sin(uTime * 1.1 + map.b * 6.28318);
  color.rgb *= mix(1.0, twinkle, smoothstep(0.2, 0.65, map.g));
  gl_FragColor = color;
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(src));
    image.src = src;
  });
}

function upload(
  gl: WebGLRenderingContext,
  image: HTMLImageElement,
  unit: number,
) {
  const texture = gl.createTexture();
  if (!texture) return null;
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

/**
 * Parallaxe de profondeur sur la photo existante.
 * Un plan WebGL suffit : les pixels proches (verre, laiton) glissent plus que le ciel.
 * L’image HTML reste en place tant que la scène n’a pas dessiné sa première frame.
 */
export function HeroDepthField({ onLive, onFallback }: HeroDepthFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onLiveRef = useRef(onLive);
  const onFallbackRef = useRef(onFallback);

  useGSAP(() => {
    onLiveRef.current = onLive;
    onFallbackRef.current = onFallback;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      onFallbackRef.current();
      return;
    }

    const vertex = compile(gl, gl.VERTEX_SHADER, VERT);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vertex || !fragment) {
      onFallbackRef.current();
      return;
    }
    const program = gl.createProgram();
    if (!program) {
      onFallbackRef.current();
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, "aPos");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      onFallbackRef.current();
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const colorLoc = gl.getUniformLocation(program, "uColor");
    const depthLoc = gl.getUniformLocation(program, "uDepth");
    const pointerLoc = gl.getUniformLocation(program, "uPointer");
    const coverScaleLoc = gl.getUniformLocation(program, "uCoverScale");
    const coverOffsetLoc = gl.getUniformLocation(program, "uCoverOffset");
    const scrollLoc = gl.getUniformLocation(program, "uScroll");
    const timeLoc = gl.getUniformLocation(program, "uTime");
    gl.uniform1i(colorLoc, 0);
    gl.uniform1i(depthLoc, 1);

    const motion = { x: 0, y: 0, scroll: 0 };
    const followX = gsap.quickTo(motion, "x", { duration: 1.05, ease: "power3.out" });
    const followY = gsap.quickTo(motion, "y", { duration: 1.05, ease: "power3.out" });
    const followScroll = gsap.quickTo(motion, "scroll", { duration: 1.2, ease: "power2.out" });

    let colorTex: WebGLTexture | null = null;
    let depthTex: WebGLTexture | null = null;
    let imageW = HERO_ARTWORK.desktop.width;
    let imageH = HERO_ARTWORK.desktop.height;
    let ready = false;
    let visible = true;
    let announced = false;
    let disposed = false;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width < 2 || height < 2) return false;
      const areaCap = 1_100_000;
      const dprCap = 1.25;
      let dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      if (width * height * dpr * dpr > areaCap) {
        dpr = Math.sqrt(areaCap / (width * height));
      }
      const bufferW = Math.max(1, Math.round(width * dpr));
      const bufferH = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== bufferW || canvas.height !== bufferH) {
        canvas.width = bufferW;
        canvas.height = bufferH;
        gl.viewport(0, 0, bufferW, bufferH);
      }
      const scale = Math.max(width / imageW, height / imageH);
      const displayW = imageW * scale;
      const displayH = imageH * scale;
      gl.uniform2f(coverScaleLoc, width / displayW, height / displayH);
      gl.uniform2f(
        coverOffsetLoc,
        (displayW - width) / 2 / displayW,
        (displayH - height) / 2 / displayH,
      );
      return true;
    };

    const origin = gsap.ticker.time;
    const draw = () => {
      if (disposed || !ready || !visible || document.hidden) return;
      if (!resize()) return;
      gl.uniform2f(pointerLoc, motion.x, motion.y);
      gl.uniform1f(scrollLoc, motion.scroll);
      gl.uniform1f(timeLoc, gsap.ticker.time - origin);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!announced) {
        announced = true;
        canvas.style.opacity = "1";
        canvas.dataset.heroDepth = "live";
        onLiveRef.current();
      }
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside || rect.width < 2 || rect.height < 2) {
        followX(0);
        followY(0);
        return;
      }
      followX(((event.clientX - rect.left) / rect.width - 0.5) * 2);
      followY(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    };

    const onScroll = () => {
      const rect = canvas.getBoundingClientRect();
      const progress = rect.height > 0 ? Math.min(1, Math.max(0, -rect.top / rect.height)) : 0;
      followScroll(progress);
    };

    let ticking = false;
    const syncTicker = () => {
      const shouldDraw = visible && !document.hidden && !disposed;
      if (shouldDraw && !ticking) {
        gsap.ticker.add(draw);
        ticking = true;
      } else if (!shouldDraw && ticking) {
        gsap.ticker.remove(draw);
        ticking = false;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      syncTicker();
    });
    observer.observe(canvas);
    const onVisibility = () => syncTicker();

    if (finePointer) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    syncTicker();
    onScroll();

    const media = window.matchMedia(HERO_ARTWORK.mobileMedia);
    const mountTextures = (color: HTMLImageElement, depth: HTMLImageElement) => {
      if (disposed) return;
      if (colorTex) gl.deleteTexture(colorTex);
      if (depthTex) gl.deleteTexture(depthTex);
      imageW = color.naturalWidth || imageW;
      imageH = color.naturalHeight || imageH;
      colorTex = upload(gl, color, 0);
      depthTex = upload(gl, depth, 1);
      ready = Boolean(colorTex && depthTex);
      if (!ready) onFallbackRef.current();
    };

    const loadPair = () => {
      const mobile = media.matches;
      const colorSrc = mobile ? HERO_ARTWORK.mobile.src : HERO_ARTWORK.desktop.src;
      const depthSrc = mobile ? HERO_ARTWORK.depthMobile : HERO_ARTWORK.depthDesktop;
      return Promise.all([loadImage(colorSrc), loadImage(depthSrc)])
        .then(([color, depth]) => {
          if (!disposed) mountTextures(color, depth);
        })
        .catch(() => {
          if (!disposed) onFallbackRef.current();
        });
    };

    const onMedia = () => {
      ready = false;
      void loadPair();
    };
    media.addEventListener("change", onMedia);
    void loadPair();

    const onLost = (event: Event) => {
      event.preventDefault();
      ready = false;
      canvas.style.opacity = "0";
      canvas.dataset.heroDepth = "off";
      onFallbackRef.current();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      if (ticking) gsap.ticker.remove(draw);
      document.removeEventListener("visibilitychange", onVisibility);
      followX.tween?.kill();
      followY.tween?.kill();
      followScroll.tween?.kill();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      media.removeEventListener("change", onMedia);
      canvas.removeEventListener("webglcontextlost", onLost);
      observer.disconnect();
      if (colorTex) gl.deleteTexture(colorTex);
      if (depthTex) gl.deleteTexture(depthTex);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, { scope: canvasRef });

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-hero-depth="pending"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0 }}
    />
  );
}
