'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui';
import { addToCart } from '@/features/cart';
import { useAppDispatch } from '@/store/hooks';

import type { Product } from '../types';
import { formatPrice } from '../utils';
import { StarRating } from './StarRating';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await dispatch(addToCart({ id: product.id, quantity: 1 })).unwrap();
      toast.success('Product added to cart!');
    } catch {
      toast.error('Product could not be added to cart.');
    } finally {
      setIsAdding(false);
    }
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
        isLoading={isAdding}
      >
        Add Cart
      </Button>
    </div>
  );
}
