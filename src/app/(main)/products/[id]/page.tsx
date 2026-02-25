import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  fetchProductById,
  OrderSummaryBar,
  ProductImageGallery,
  ProductInfo,
} from '@/features/products';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const product = await fetchProductById(id);
    return {
      title: product.title,
      description: product.description,
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  let product;
  try {
    product = await fetchProductById(id);
  } catch {
    notFound();
  }

  return (
    <>
      <div className="mx-auto max-w-360 bg-white px-4 pt-6 pb-28 md:px-20 md:pt-10 md:pb-32">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
          {/* Left: Image gallery */}
          <ProductImageGallery images={product.images} title={product.title} />

          {/* Right: Product info */}
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Sticky order summary bar */}
      <OrderSummaryBar product={product} />
    </>
  );
}
