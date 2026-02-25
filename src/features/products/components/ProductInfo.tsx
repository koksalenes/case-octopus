'use client';

import type { Product } from '../types';
import { ColorSelector } from './ColorSelector';
import { FeatureSelector } from './FeatureSelector';
import { ProductReviews } from './ProductReviews';

interface ProductInfoProps {
  product: Product;
}

const PLACEHOLDER_COLORS = [
  { name: 'Silver', color: '#C0C0C0' },
  { name: 'Black', color: '#000000' },
];

const PLACEHOLDER_FEATURES = [
  {
    id: 'feature-1',
    title: 'Product Feature 1',
    description: 'Lorem Ipsum Dolor Sit Amet',
  },
  {
    id: 'feature-2',
    title: 'Product Feature 2',
    description: 'Lorem Ipsum Dolor Sit Amet',
  },
  {
    id: 'feature-3',
    title: 'Product Feature 3',
    description: 'Lorem Ipsum Dolor Sit Amet',
  },
  {
    id: 'feature-4',
    title: 'Product Feature 4',
    description: 'Lorem Ipsum Dolor Sit Amet',
  },
];

export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-14 lg:max-w-191.75">
      {/* Title & Description */}
      <div className="flex flex-col gap-2.5">
        <h1 className="font-heading text-2xl leading-[137.5%] font-bold text-black md:text-[40px]">
          {product.title}
        </h1>
        <p className="font-heading text-base leading-[150%] font-normal text-[#888888] md:text-xl">
          {product.description}
        </p>
      </div>

      {/* Color Selector */}
      <ColorSelector colors={PLACEHOLDER_COLORS} defaultSelected="Black" />

      {/* Feature Selector */}
      <FeatureSelector
        features={PLACEHOLDER_FEATURES}
        defaultSelectedId="feature-1"
      />

      {/* Reviews */}
      <ProductReviews reviews={product.reviews} />
    </div>
  );
}
