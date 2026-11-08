import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductOptions from "@/components/ProductOptions";
import ShopShell from "@/components/ShopShell";
import { getProductBySlug, getProductSlugs } from "@/lib/queries/products";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  const url = `${SITE_URL}/products/${product.slug}`;
  const description =
    product.description ||
    `Shop ${product.name} from Fulcrum Wear, delivered across Zimbabwe.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_ZW",
      title: `${product.name} | Fulcrum Wear`,
      description,
      url,
      images: [{ url: product.imageUrl, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Fulcrum Wear`,
      description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const firstVariant = product.colors.flatMap((color) => color.sizes)[0];

  const productUrl = `${SITE_URL}/products/${product.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${productUrl}#product`,
      name: product.name,
      description: product.description,
      image: [product.imageUrl],
      sku: firstVariant?.sku ?? product.slug,
      brand: { "@type": "Brand", name: SITE_NAME },
      category: product.category.name,
      url: productUrl,
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "USD",
        price: product.price.toFixed(2),
        availability: product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: `${SITE_URL}/#shop`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: productUrl,
        },
      ],
    },
  ];

  return (
    <ShopShell>
      <div className="max-w-7xl 2xl:max-w-[90rem] mx-auto px-4 py-8">
        <nav className="text-sm text-coal/60" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/#shop" className="hover:underline">
            Shop
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-coal">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="relative bg-mist rounded-lg overflow-hidden aspect-square">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-contain p-8 mix-blend-multiply"
            />
            {!product.inStock ? (
              <span className="absolute top-4 right-4 bg-ink text-white text-sm font-bold px-3 py-1.5 rounded">
                Out of stock
              </span>
            ) : null}
          </div>

          <div>
            <p className="text-sm text-coal/60">{product.category.name}</p>
            <h1 className="d text-3xl md:text-4xl mt-1">{product.name}</h1>
            {product.tag ? (
              <span className="inline-block mt-3 bg-gold text-ink text-xs font-bold px-2 py-1 rounded">
                {product.tag}
              </span>
            ) : null}
            <p className="mt-4 text-coal/75">{product.description}</p>
            <p className="mt-2 text-sm text-coal/60">
              {product.totalStock} units in stock across{" "}
              {product.colors.length}{" "}
              {product.colors.length === 1 ? "colour" : "colours"}
            </p>

            <ProductOptions product={product} />

            <div className="mt-8 border-t border-mist pt-4 text-sm text-coal/60">
              <p>Nationwide delivery across Zimbabwe.</p>
              <p>Pay with EcoCash, InnBucks or Zimswitch via Paynow.</p>
            </div>
          </div>
        </div>

        <Link
          href="/#shop"
          className="inline-block mt-10 font-semibold underline"
        >
          Back to all workwear
        </Link>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </ShopShell>
  );
}
