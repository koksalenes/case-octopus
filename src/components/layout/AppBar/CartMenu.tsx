'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui';
import { checkoutCart, fetchCart } from '@/features/cart';
import { formatPrice } from '@/features/products/utils';
import { useClickOutside } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function CartMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cart = useAppSelector((state) => state.cart.data);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleClose = useCallback(() => setIsOpen(false), []);
  useClickOutside(dropdownRef, handleClose);

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await dispatch(checkoutCart()).unwrap();
      toast.success('Payment completed successfully!');
      setIsOpen(false);
    } catch {
      toast.error('Payment failed!');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalDistinctItems = cart?.products?.length || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Cart"
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-surface-input focus-visible:ring-primary relative rounded-lg p-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:p-1.5"
      >
        <Image
          src="/assets/icons/cart.svg"
          alt=""
          width={24}
          height={24}
          className="size-5 md:size-7"
          priority
        />
        {totalDistinctItems > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {totalDistinctItems}
          </span>
        )}
      </button>

      {/* Cart Dropdown */}
      {isOpen && (
        <div className="border-border-subtle absolute top-full right-0 z-50 mt-2 flex max-h-[80vh] w-80 flex-col rounded-xl border bg-white p-4 shadow-xl md:w-96">
          <h3 className="mb-3 border-b pb-2 text-lg font-bold">
            Cart ({totalDistinctItems} Product)
          </h3>

          <div className="mb-4 flex-1 space-y-4 overflow-y-auto">
            {!cart || cart.products.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                Your cart is empty.
              </p>
            ) : (
              cart.products.map((product) => (
                <Link
                  href={`/products/${product.id}`}
                  onClick={() => setIsOpen(false)}
                  key={product.id}
                  className="-mx-1 flex gap-3 rounded border-b p-1 pb-3 transition-colors last:border-0 last:pb-0 hover:bg-gray-50"
                >
                  <div className="bg-surface-neutral relative h-16 w-16 shrink-0 rounded">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <p className="truncate text-sm font-medium">
                      {product.title}
                    </p>
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Count: {product.quantity}
                      </span>
                      <span className="text-sm font-bold">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {cart && cart.products.length > 0 && (
            <div className="border-t pt-4">
              <div className="mb-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full"
                variant="primary"
                isLoading={isCheckingOut}
              >
                Pay Now
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
