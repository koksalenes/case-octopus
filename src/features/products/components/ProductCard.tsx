'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui';
import { useAddToCart } from '@/hooks';

import type { Product } from '../types';
import { formatPrice } from '../utils';
import { StarRating } from './StarRating';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { add, isAdding } = useAddToCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await add(product.id);
  };

  return (
    <div className="mx-auto flex w-full max-w-77.75 flex-col gap-4">
      {/* navigates to product detail */}
      <Link
        href={`/products/${product.id}`}
        className="group flex flex-col gap-4"
      >
        {/* Image container */}
        <div className="bg-surface-neutral relative h-44 w-full overflow-hidden">
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 311px"
            className="object-contain transition-transform group-hover:scale-105"
            priority={false}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <p className="font-heading truncate text-base font-normal tracking-wide text-black">
            {product.title}
          </p>
          <p className="font-heading text-category truncate text-base font-normal tracking-wide">
            {product.category.charAt(0).toUpperCase() +
              product.category.slice(1)}
          </p>
          <p className="font-heading text-base font-bold tracking-wide text-black">
            {formatPrice(product.price)}
          </p>
          <StarRating rating={product.rating} />
        </div>
      </Link>

      {/* Add to cart button */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleAddToCart}
        isLoading={isAdding(product.id)}
      >
        Add Cart
      </Button>
    </div>
  );
}
