'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui';

import type { ProductReview } from '../types';
import { ReviewStarRating } from './ReviewStarRating';

interface ProductReviewsProps {
  reviews: ProductReview[];
}

function ReviewItem({ review }: { review: ProductReview }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const el = textRef.current;
      if (el) {
        setIsOverflowing(el.scrollHeight > 85);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [review.comment]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <span className="font-sans text-[18px] leading-[144.69%] font-medium text-black">
          {review.reviewerName}
        </span>
        <ReviewStarRating rating={review.rating} />
      </div>

      <div
        className={`relative ${!expanded ? 'max-h-20.25 overflow-hidden' : ''}`}
      >
        <p
          ref={textRef}
          className="font-sans text-[18px] leading-[150%] font-normal wrap-break-word text-black"
        >
          {review.comment}
          {expanded && isOverflowing && (
            <button
              onClick={() => setExpanded(false)}
              className="text-primary ml-2 inline-block font-sans text-[18px] leading-[150%] font-normal whitespace-nowrap hover:underline"
            >
              show less
            </button>
          )}
        </p>

        {!expanded && isOverflowing && (
          <div className="absolute right-0 bottom-0 flex items-center">
            <div className="h-6.75 w-12 bg-linear-to-r from-transparent to-white" />
            <div className="flex h-6.75 items-center bg-white pr-1">
              <span className="font-sans text-[18px] leading-[150%] font-normal tracking-normal text-black">
                ...
              </span>
              <button
                onClick={() => setExpanded(true)}
                className="text-primary ml-1 font-sans text-[18px] leading-[150%] font-normal whitespace-nowrap hover:underline"
              >
                show more
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const VISIBLE_REVIEWS_COUNT = 2;

export function ProductReviews({ reviews }: ProductReviewsProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleReviews = showAll
    ? reviews
    : reviews.slice(0, VISIBLE_REVIEWS_COUNT);

  if (reviews.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      <h3 className="font-heading text-base leading-[137.5%] font-bold text-black">
        Product Reviews
      </h3>

      <div className="flex flex-col gap-6">
        {visibleReviews.map((review, index) => (
          <div key={review.reviewerEmail + review.date}>
            {index > 0 && (
              <div className="border-border-subtle mb-6 border-t" />
            )}
            <ReviewItem review={review} />
          </div>
        ))}
      </div>

      {reviews.length > VISIBLE_REVIEWS_COUNT && !showAll && (
        <div className="mt-2 flex flex-col items-start">
          <Button variant="secondary" onClick={() => setShowAll(true)}>
            View All
          </Button>
        </div>
      )}
    </div>
  );
}
