'use client';

import Image from 'next/image';

import { Button } from '@/components/ui';
import { useAddToCart } from '@/hooks';

import type { Product } from '../types';
import { formatPrice } from '../utils';

interface OrderSummaryBarProps {
  product: Product;
}

export function OrderSummaryBar({ product }: OrderSummaryBarProps) {
  const { add, isAdding } = useAddToCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await add(product.id);
  };

  return (
    <div className="border-border-medium fixed bottom-0 left-0 z-50 w-full border-t-[0.5px] bg-white">
      <div className="mx-auto flex h-16 max-w-360 items-center justify-between px-4 md:h-20 md:px-8">
        {/* Left section – hidden on mobile, visible on md+ */}
        <div className="hidden min-w-0 flex-1 items-center gap-4 pr-4 md:flex lg:gap-8 lg:pr-8">
          <h2 className="font-heading text-[18px] leading-8.25 font-bold tracking-[0.01em] whitespace-nowrap text-black lg:text-[22px]">
            Order Summary
          </h2>

          {/* Divider */}
          <div className="h-16 w-0 shrink-0 border-l border-black/20 md:h-20" />

          {/* Product info */}
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="font-heading truncate text-lg leading-[137.5%] font-bold text-black">
                {product.title}
              </span>
              <span className="font-heading text-description truncate text-base leading-[137.5%] font-normal">
                {product.description.length > 60
                  ? `${product.description.slice(0, 60)}...`
                  : product.description}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile: product title + price */}
        <div className="flex min-w-0 flex-col md:hidden">
          <span className="font-heading truncate text-sm font-bold text-black">
            {product.title}
          </span>
          <span className="font-heading text-lg font-medium text-black">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Right section */}
        <div className="flex shrink-0 items-center gap-4">
          <span className="font-heading hidden text-[34px] leading-[137.5%] font-medium text-black md:block">
            {formatPrice(product.price)}
          </span>
          <Button
            variant="primary"
            className="h-11 w-30 md:w-37.5"
            onClick={handleAddToCart}
            isLoading={isAdding(product.id)}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
