import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ProductReview } from '../types';
import { ProductReviews } from './ProductReviews';

function makeReview(overrides: Partial<ProductReview> = {}): ProductReview {
  return {
    rating: 4,
    comment: 'Great product, highly recommended.',
    date: '2024-01-15T10:00:00Z',
    reviewerName: 'John Doe',
    reviewerEmail: 'john.doe@example.com',
    ...overrides,
  };
}

const reviews = Array.from({ length: 4 }, (_, i) =>
  makeReview({
    reviewerName: `Reviewer ${i + 1}`,
    reviewerEmail: `reviewer${i + 1}@example.com`,
    comment: `Comment ${i + 1}`,
  }),
);

afterEach(() => {
  vi.clearAllMocks();
});

const getHeading = () =>
  screen.getByRole('heading', { name: /product reviews/i });
const getViewAllButton = () =>
  screen.getByRole('button', { name: /view all/i });
const queryViewAllButton = () =>
  screen.queryByRole('button', { name: /view all/i });

describe('ProductReviews', () => {
  describe('empty state', () => {
    it('renders nothing when the reviews array is empty', () => {
      const { container } = render(<ProductReviews reviews={[]} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('with reviews', () => {
    it('renders the "Product Reviews" section heading', () => {
      render(<ProductReviews reviews={reviews} />);
      expect(getHeading()).toBeInTheDocument();
    });

    it('shows only the first 2 reviews initially', () => {
      render(<ProductReviews reviews={reviews} />);
      expect(screen.getByText('Reviewer 1')).toBeInTheDocument();
      expect(screen.getByText('Reviewer 2')).toBeInTheDocument();
      expect(screen.queryByText('Reviewer 3')).not.toBeInTheDocument();
      expect(screen.queryByText('Reviewer 4')).not.toBeInTheDocument();
    });

    it('renders reviewer names and their comments', () => {
      render(<ProductReviews reviews={[makeReview()]} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(
        screen.getByText('Great product, highly recommended.'),
      ).toBeInTheDocument();
    });

    it('shows a "View All" button when there are more than 2 reviews', () => {
      render(<ProductReviews reviews={reviews} />);
      expect(getViewAllButton()).toBeInTheDocument();
    });

    it('does not show "View All" when there are exactly 2 reviews', () => {
      render(<ProductReviews reviews={reviews.slice(0, 2)} />);
      expect(queryViewAllButton()).not.toBeInTheDocument();
    });

    it('does not show "View All" when there is only 1 review', () => {
      render(<ProductReviews reviews={[makeReview()]} />);
      expect(queryViewAllButton()).not.toBeInTheDocument();
    });
  });

  describe('"View All" expansion', () => {
    it('reveals all reviews after clicking "View All"', async () => {
      const user = userEvent.setup();
      render(<ProductReviews reviews={reviews} />);

      await user.click(getViewAllButton());

      reviews.forEach(({ reviewerName }) => {
        expect(screen.getByText(reviewerName)).toBeInTheDocument();
      });
    });

    it('hides the "View All" button once all reviews are showing', async () => {
      const user = userEvent.setup();
      render(<ProductReviews reviews={reviews} />);

      await user.click(getViewAllButton());

      expect(queryViewAllButton()).not.toBeInTheDocument();
    });
  });

  describe('review text overflow', () => {
    const LONG_COMMENT =
      'This is a very long review comment that will definitely overflow the container height threshold when rendered on screen.';

    function renderWithOverflow() {
      render(
        <ProductReviews reviews={[makeReview({ comment: LONG_COMMENT })]} />,
      );

      const paragraph = screen.getByText(LONG_COMMENT);
      Object.defineProperty(paragraph, 'scrollHeight', {
        value: 200,
        configurable: true,
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
    }

    it('shows a "show more" button when the comment exceeds the height threshold', () => {
      renderWithOverflow();
      expect(
        screen.getByRole('button', { name: /show more/i }),
      ).toBeInTheDocument();
    });

    it('does not show "show more" when the comment fits within the threshold', () => {
      render(<ProductReviews reviews={[makeReview()]} />);
      expect(
        screen.queryByRole('button', { name: /show more/i }),
      ).not.toBeInTheDocument();
    });

    it('expands the comment and shows "show less" when "show more" is clicked', async () => {
      const user = userEvent.setup();
      renderWithOverflow();

      await user.click(screen.getByRole('button', { name: /show more/i }));

      expect(
        screen.getByRole('button', { name: /show less/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /show more/i }),
      ).not.toBeInTheDocument();
    });

    it('collapses back and restores "show more" when "show less" is clicked', async () => {
      const user = userEvent.setup();
      renderWithOverflow();

      await user.click(screen.getByRole('button', { name: /show more/i }));
      await user.click(screen.getByRole('button', { name: /show less/i }));

      expect(
        screen.getByRole('button', { name: /show more/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /show less/i }),
      ).not.toBeInTheDocument();
    });
  });
});
