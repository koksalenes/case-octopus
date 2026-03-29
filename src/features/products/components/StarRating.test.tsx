import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StarRating } from './StarRating';

const getFilledStars = () => screen.queryAllByAltText('filled star');
const getHalfStars = () => screen.queryAllByAltText('half star');
const getEmptyStars = () => screen.queryAllByAltText('empty star');

function renderStarRating(rating: number, maxStars?: number) {
  render(
    maxStars !== undefined ? (
      <StarRating rating={rating} maxStars={maxStars} />
    ) : (
      <StarRating rating={rating} />
    ),
  );
}

describe('StarRating', () => {
  describe('whole-number ratings', () => {
    it('renders 5 empty stars for a rating of 0', () => {
      renderStarRating(0);
      expect(getFilledStars()).toHaveLength(0);
      expect(getHalfStars()).toHaveLength(0);
      expect(getEmptyStars()).toHaveLength(5);
    });

    it('renders 5 filled stars for a perfect rating of 5', () => {
      renderStarRating(5);
      expect(getFilledStars()).toHaveLength(5);
      expect(getHalfStars()).toHaveLength(0);
      expect(getEmptyStars()).toHaveLength(0);
    });

    it('renders 3 filled and 2 empty stars for a rating of 3', () => {
      renderStarRating(3);
      expect(getFilledStars()).toHaveLength(3);
      expect(getHalfStars()).toHaveLength(0);
      expect(getEmptyStars()).toHaveLength(2);
    });
  });

  describe('fractional ratings — half-star threshold', () => {
    it('shows a half star when the fractional part is exactly 0.25 (lower bound)', () => {
      renderStarRating(4.25);
      expect(getFilledStars()).toHaveLength(4);
      expect(getHalfStars()).toHaveLength(1);
      expect(getEmptyStars()).toHaveLength(0);
    });

    it('shows a half star when the fractional part is 0.5', () => {
      renderStarRating(4.5);
      expect(getFilledStars()).toHaveLength(4);
      expect(getHalfStars()).toHaveLength(1);
      expect(getEmptyStars()).toHaveLength(0);
    });

    it('rounds up to a full star when the fractional part reaches 0.75 (upper bound)', () => {
      renderStarRating(4.75);
      expect(getFilledStars()).toHaveLength(5);
      expect(getHalfStars()).toHaveLength(0);
      expect(getEmptyStars()).toHaveLength(0);
    });

    it('truncates to a whole star when the fractional part is below 0.25', () => {
      renderStarRating(3.1);
      expect(getFilledStars()).toHaveLength(3);
      expect(getHalfStars()).toHaveLength(0);
      expect(getEmptyStars()).toHaveLength(2);
    });

    it('rounds up for a fractional part of exactly 0.75 at a lower base star count', () => {
      renderStarRating(2.75);
      expect(getFilledStars()).toHaveLength(3);
      expect(getHalfStars()).toHaveLength(0);
      expect(getEmptyStars()).toHaveLength(2);
    });
  });

  describe('total star count invariant', () => {
    it('total rendered stars always equals maxStars (default 5)', () => {
      const testRatings = [0, 1, 1.5, 2.25, 3, 3.75, 4.5, 5];

      testRatings.forEach((rating) => {
        const { unmount } = render(<StarRating rating={rating} />);
        const total =
          getFilledStars().length +
          getHalfStars().length +
          getEmptyStars().length;
        expect(total).toBe(5);
        unmount();
      });
    });
  });

  describe('custom maxStars prop', () => {
    it('respects maxStars=3 with a full rating', () => {
      renderStarRating(3, 3);
      expect(getFilledStars()).toHaveLength(3);
      expect(getEmptyStars()).toHaveLength(0);
    });

    it('renders empty stars up to maxStars=3 for a rating of 1', () => {
      renderStarRating(1, 3);
      expect(getFilledStars()).toHaveLength(1);
      expect(getEmptyStars()).toHaveLength(2);
    });

    it('applies the same half-star logic with a custom maxStars', () => {
      renderStarRating(1.5, 3);
      expect(getFilledStars()).toHaveLength(1);
      expect(getHalfStars()).toHaveLength(1);
      expect(getEmptyStars()).toHaveLength(1);
    });
  });
});
