'use client';

import { useEffect } from 'react';

import { ProductGridSkeleton } from './ProductGridSkeleton';
import { useProductsLoading } from './ProductsLoadingContext';

interface ProductContentWrapperProps {
  children: React.ReactNode;
  dataKey: string;
}

export function ProductContentWrapper({
  children,
  dataKey,
}: ProductContentWrapperProps) {
  const { isProductsLoading, setIsProductsLoading } = useProductsLoading();

  useEffect(() => {
    setIsProductsLoading(false);
  }, [dataKey, setIsProductsLoading]);

  if (isProductsLoading) {
    return <ProductGridSkeleton />;
  }

  return <div className="flex flex-1 flex-col gap-6">{children}</div>;
}
