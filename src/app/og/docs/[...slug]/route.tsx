import { getPageImage, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';

export const revalidate = false;

const interFont = fetch(
  'https://fonts.gstatic.com/s/inter/v20/UcCo3FwrK3iLTcviYwYZ90A2N58.woff2'
).then((res) => res.arrayBuffer());

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
    'https://voux-docs.vercel.app';
  const logoUrl = new URL('/assets/logo.png', siteUrl).toString();
  const interData = await interFont;

  return new ImageResponse(
    (
      <DefaultImage
        title={page.data.title}
        description={page.data.description}
        site="Voux Docs"
        icon={
          <img
            src={logoUrl}
            width={96}
            height={96}
            alt="Voux"
          />
        }
      />
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interData,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: interData,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
