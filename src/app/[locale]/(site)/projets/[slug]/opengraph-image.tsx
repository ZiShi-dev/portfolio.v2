import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { ImageResponse } from "next/og";
import type { Locale } from "@/i18n/routing";
import { brand } from "@/lib/brand";
import { getSiteProjectBySlug } from "@/lib/projects/site";

export const alt = `${brand.name} — aperçu du projet`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

const LOCAL_MIME_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function asDataUrl(data: ArrayBuffer | Uint8Array, mimeType: string) {
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

async function loadImage(src: string): Promise<string> {
  if (/^https?:\/\//i.test(src)) {
    const response = await fetch(src, { cache: "no-store" });
    if (!response.ok) throw new Error(`project_image_${response.status}`);
    const mimeType = response.headers.get("content-type")?.split(";")[0];
    if (!mimeType?.startsWith("image/")) {
      throw new Error("project_image_invalid_content_type");
    }
    return asDataUrl(await response.arrayBuffer(), mimeType);
  }

  const publicRoot = resolve(process.cwd(), "public");
  const relativePath = decodeURIComponent(src.split(/[?#]/, 1)[0] ?? "")
    .replace(/^[/\\]+/, "");
  const filePath = resolve(publicRoot, relativePath);
  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${sep}`)) {
    throw new Error("project_image_invalid_path");
  }

  const mimeType = LOCAL_MIME_TYPES[extname(filePath).toLowerCase()];
  if (!mimeType) throw new Error("project_image_unsupported_type");
  return asDataUrl(await readFile(filePath), mimeType);
}

async function projectCoverDataUrl(src?: string) {
  const fallback = brand.heroBanner;
  try {
    return await loadImage(src || fallback);
  } catch {
    return loadImage(fallback);
  }
}

export default async function ProjectOpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = await getSiteProjectBySlug(locale as Locale, slug);
  const cover = await projectCoverDataUrl(project?.images[0]?.src);
  const title = project?.title || brand.titleSuffix;
  const category = project?.category || brand.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#070A12",
          color: "#F4F1E8",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          width={size.width}
          height={size.height}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(7,10,18,0.08) 18%, rgba(7,10,18,0.94) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 54,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              marginBottom: 18,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#D4AF7A",
            }}
          >
            {brand.name} · {category}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 1030,
              fontSize: title.length > 42 ? 54 : 66,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              textShadow: "0 3px 20px rgba(0,0,0,0.65)",
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
