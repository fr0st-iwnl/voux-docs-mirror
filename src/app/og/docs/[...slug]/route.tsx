/** biome-ignore-all lint/a11y/noSvgWithoutTitle: OG image */
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPageImage, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import type { ReactElement } from 'react';

export const revalidate = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fontPath = join(__dirname, './Geist-Bold.woff');

const foreground = '#ffffff';
const mutedForeground = '#a1a1a1';
const background = '#0f1115';

interface GenerateOptions {
  title: string;
  description?: string;
  siteUrl: string;
}

function generate({ title, description, siteUrl }: GenerateOptions): ReactElement {
  const logoUrl = new URL('/assets/logo.png', siteUrl).toString();

  return (
    <div
      style={{
        color: foreground,
        background,
      }}
      tw="flex flex-col w-full h-full p-12"
    >
      <div tw="flex flex-col justify-center">
        <div tw="flex flex-col rounded-2xl p-8">
          <p tw="font-bold text-7xl">{title}</p>
          {description ? (
            <p
              tw="text-4xl"
              style={{
                color: mutedForeground,
              }}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div tw="flex flex-row justify-between items-center mt-auto p-8">
        <div tw="flex flex-row items-center">
          <img src={logoUrl} width={48} height={48} alt="Voux" />
          <p tw="text-4xl font-medium pl-4">Voux</p>
        </div>
        <p tw="text-4xl font-medium" style={{ color: mutedForeground }}>
          Documentation
        </p>
      </div>
    </div>
  );
}

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/docs/[...slug]'>,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_DOCS_BASE_URL ||
    'http://localhost:3000';
  let fontData: ArrayBuffer | null = null;
  try {
    const file = await readFile(fontPath);
    fontData = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  } catch (_) {
    fontData = null;
  }

  return new ImageResponse(
    generate({
      title: page.data.title,
      description: page.data.description,
      siteUrl,
    }),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [
            {
              name: 'Geist',
              data: fontData,
              weight: 700,
              style: 'normal',
            },
          ]
        : [],
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
