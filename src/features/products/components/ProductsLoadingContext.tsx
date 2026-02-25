'use client';

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
} from 'react';

interface ProductsLoadingContextType {
  isProductsLoading: boolean;
  setIsProductsLoading: Dispatch<SetStateAction<boolean>>;
}

const ProductsLoadingContext = createContext<ProductsLoadingContextType>({
  isProductsLoading: false,
  setIsProductsLoading: () => {},
});

export function ProductsLoadingProvider({ children }: { children: ReactNode }) {
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  return (
    <ProductsLoadingContext value={{ isProductsLoading, setIsProductsLoading }}>
      {children}
    </ProductsLoadingContext>
  );
}

export function useProductsLoading() {
  return useContext(ProductsLoadingContext);
}
