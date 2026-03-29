import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render-utils';

import { ProductSidebar } from './ProductSidebar';
import { ProductsLoadingProvider } from './ProductsLoadingContext';

vi.mock('@/hooks', async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>;
  return {
    ...mod,
    useDebouncedCallback: (cb: () => void) => cb,
  };
});

const mockPush = vi.fn();

const getSearchInput = () =>
  screen.getByRole('textbox', { name: /quick search/i });
const queryClearSearchButton = () =>
  screen.queryByRole('button', { name: /clear search/i });
const getClearSearchButton = () =>
  screen.getByRole('button', { name: /clear search/i });
const getCategoryCheckbox = (name: string) =>
  screen.getByRole('checkbox', { name: new RegExp(name, 'i') });
const queryClearCategoriesButton = () =>
  screen.queryByRole('button', { name: /^clear \(/i });
const getClearCategoriesButton = () =>
  screen.getByRole('button', { name: /^clear \(/i });
const getFilterButton = () => screen.getByRole('button', { name: /filter/i });

interface RenderOptions {
  categories?: string[];
  currentCategories?: string[];
  currentSearch?: string;
  searchParams?: URLSearchParams;
}

function renderSidebar({
  categories = ['smartphones', 'laptops', 'fragrances'],
  currentCategories = [],
  currentSearch = '',
  searchParams = new URLSearchParams(),
}: RenderOptions = {}) {
  vi.mocked(useSearchParams).mockReturnValue(
    searchParams as ReadonlyURLSearchParams,
  );
  return renderWithProviders(
    <ProductsLoadingProvider>
      <ProductSidebar
        categories={categories}
        currentCategories={currentCategories}
        currentSearch={currentSearch}
      />
    </ProductsLoadingProvider>,
  );
}

beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  });
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams() as ReadonlyURLSearchParams,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProductSidebar', () => {
  describe('initial render', () => {
    it('renders the search input', () => {
      renderSidebar();
      expect(getSearchInput()).toBeInTheDocument();
    });

    it('renders with an empty search value by default', () => {
      renderSidebar();
      expect(getSearchInput()).toHaveValue('');
    });

    it('renders the "Categories" heading', () => {
      renderSidebar();
      expect(
        screen.getByRole('heading', { name: /categories/i }),
      ).toBeInTheDocument();
    });

    it('renders all category labels', () => {
      renderSidebar({ categories: ['smartphones', 'laptops'] });
      expect(screen.getByText('Smartphones')).toBeInTheDocument();
      expect(screen.getByText('Laptops')).toBeInTheDocument();
    });

    it('renders a Filter button', () => {
      renderSidebar();
      expect(getFilterButton()).toBeInTheDocument();
    });

    it('does not show the clear search button when the input is empty', () => {
      renderSidebar();
      expect(queryClearSearchButton()).not.toBeInTheDocument();
    });

    it('does not show the clear categories button when no category is selected', () => {
      renderSidebar();
      expect(queryClearCategoriesButton()).not.toBeInTheDocument();
    });
  });

  describe('pre-populated props', () => {
    it('pre-fills the search input from currentSearch', () => {
      renderSidebar({ currentSearch: 'iphone' });
      expect(getSearchInput()).toHaveValue('iphone');
    });

    it('pre-checks categories supplied via currentCategories', () => {
      renderSidebar({
        categories: ['smartphones', 'laptops'],
        currentCategories: ['smartphones'],
      });
      expect(getCategoryCheckbox('Smartphones')).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(getCategoryCheckbox('Laptops')).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('shows the clear categories button when currentCategories is non-empty', () => {
      renderSidebar({
        categories: ['smartphones'],
        currentCategories: ['smartphones'],
      });
      expect(getClearCategoriesButton()).toBeInTheDocument();
    });
  });

  describe('search input', () => {
    it('updates the value as the user types', async () => {
      const user = userEvent.setup();
      renderSidebar();

      await user.type(getSearchInput(), 'phone');

      expect(getSearchInput()).toHaveValue('phone');
    });

    it('shows the clear button once the input has a value', async () => {
      const user = userEvent.setup();
      renderSidebar();

      await user.type(getSearchInput(), 'a');

      expect(queryClearSearchButton()).toBeInTheDocument();
    });

    it('clears the input value when the clear button is clicked', async () => {
      const user = userEvent.setup();
      renderSidebar();

      await user.type(getSearchInput(), 'iphone');
      await user.click(getClearSearchButton());

      expect(getSearchInput()).toHaveValue('');
    });

    it('hides the clear button after the input is cleared', async () => {
      const user = userEvent.setup();
      renderSidebar();

      await user.type(getSearchInput(), 'iphone');
      await user.click(getClearSearchButton());

      expect(queryClearSearchButton()).not.toBeInTheDocument();
    });

    it('triggers navigation once the query reaches 2 characters', async () => {
      const user = userEvent.setup();
      renderSidebar();

      await user.type(getSearchInput(), 'ip');

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('search=ip'),
      );
    });

    it('does not navigate for a single-character query', async () => {
      const user = userEvent.setup();
      renderSidebar();

      await user.type(getSearchInput(), 'i');

      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining('search='),
      );
    });

    it('does not navigate for a whitespace-only query', async () => {
      const user = userEvent.setup();
      renderSidebar();

      await user.type(getSearchInput(), '   ');

      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining('search='),
      );
    });

    it('clears the active search param when the query drops below 2 characters', async () => {
      const user = userEvent.setup();
      renderSidebar({
        currentSearch: 'iphone',
        searchParams: new URLSearchParams('search=iphone&page=1'),
      });

      mockPush.mockClear();
      await user.clear(getSearchInput());

      expect(mockPush).toHaveBeenCalledWith('/products?page=1');
      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining('search='),
      );
    });

    it('triggers navigation immediately when Enter is pressed on the input', async () => {
      const user = userEvent.setup();
      renderSidebar();

      await user.type(getSearchInput(), 'iphone');
      mockPush.mockClear();
      await user.keyboard('{Enter}');

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('search=iphone'),
      );
    });
  });

  describe('category filtering', () => {
    it('checks a category checkbox when clicked', async () => {
      const user = userEvent.setup();
      renderSidebar({ categories: ['smartphones'] });

      const checkbox = getCategoryCheckbox('Smartphones');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      await user.click(checkbox);

      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('unchecks a checked category when clicked a second time', async () => {
      const user = userEvent.setup();
      renderSidebar({
        categories: ['smartphones'],
        currentCategories: ['smartphones'],
      });

      await user.click(getCategoryCheckbox('Smartphones'));

      expect(getCategoryCheckbox('Smartphones')).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('supports selecting multiple categories independently', async () => {
      const user = userEvent.setup();
      renderSidebar({ categories: ['smartphones', 'laptops'] });

      await user.click(getCategoryCheckbox('Smartphones'));
      await user.click(getCategoryCheckbox('Laptops'));

      expect(getCategoryCheckbox('Smartphones')).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(getCategoryCheckbox('Laptops')).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });

    it('shows the Clear button when at least one category is selected', async () => {
      const user = userEvent.setup();
      renderSidebar({ categories: ['smartphones'] });

      expect(queryClearCategoriesButton()).not.toBeInTheDocument();
      await user.click(getCategoryCheckbox('Smartphones'));
      expect(getClearCategoriesButton()).toBeInTheDocument();
    });

    it('displays the count of selected categories in the Clear button', async () => {
      const user = userEvent.setup();
      renderSidebar({ categories: ['smartphones', 'laptops'] });

      await user.click(getCategoryCheckbox('Smartphones'));
      await user.click(getCategoryCheckbox('Laptops'));

      expect(getClearCategoriesButton()).toHaveTextContent('Clear (2)');
    });

    it('clears all selected categories when the Clear button is clicked', async () => {
      const user = userEvent.setup();
      renderSidebar({
        categories: ['smartphones', 'laptops'],
        currentCategories: ['smartphones', 'laptops'],
      });

      await user.click(getClearCategoriesButton());

      expect(getCategoryCheckbox('Smartphones')).toHaveAttribute(
        'aria-checked',
        'false',
      );
      expect(getCategoryCheckbox('Laptops')).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('hides the Clear button after all categories are deselected', async () => {
      const user = userEvent.setup();
      renderSidebar({
        categories: ['smartphones'],
        currentCategories: ['smartphones'],
      });

      await user.click(getClearCategoriesButton());

      expect(queryClearCategoriesButton()).not.toBeInTheDocument();
    });

    it('toggles a category when the Space key is pressed on the checkbox', async () => {
      const user = userEvent.setup();
      renderSidebar({ categories: ['smartphones'] });

      const checkbox = getCategoryCheckbox('Smartphones');
      checkbox.focus();
      await user.keyboard(' ');

      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('toggles a category when the Enter key is pressed on the checkbox', async () => {
      const user = userEvent.setup();
      renderSidebar({ categories: ['smartphones'] });

      const checkbox = getCategoryCheckbox('Smartphones');
      checkbox.focus();
      await user.keyboard('{Enter}');

      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Filter button', () => {
    it('navigates with the active categories when clicked', async () => {
      const user = userEvent.setup();
      renderSidebar({
        categories: ['smartphones'],
        currentCategories: ['smartphones'],
      });

      mockPush.mockClear();
      await user.click(getFilterButton());

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('category=smartphones'),
      );
    });

    it('always includes page=1 in the navigation URL', async () => {
      const user = userEvent.setup();
      renderSidebar({
        categories: ['smartphones'],
        currentCategories: ['smartphones'],
        searchParams: new URLSearchParams('category=smartphones&page=2'),
      });

      mockPush.mockClear();
      await user.click(getFilterButton());

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=1'));
    });

    it('does not navigate when the URL params have not changed', async () => {
      const user = userEvent.setup();
      renderSidebar({
        categories: ['smartphones'],
        currentCategories: ['smartphones'],
        searchParams: new URLSearchParams('category=smartphones&page=1'),
      });

      mockPush.mockClear();
      await user.click(getFilterButton());

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('category name formatting', () => {
    it('converts a hyphenated slug to Title Case', () => {
      renderSidebar({ categories: ['mens-shirts'] });
      expect(screen.getByText('Mens Shirts')).toBeInTheDocument();
    });

    it('handles multi-word hyphenated slugs correctly', () => {
      renderSidebar({ categories: ['skin-care'] });
      expect(screen.getByText('Skin Care')).toBeInTheDocument();
    });

    it('leaves single-word slugs unchanged except for capitalisation', () => {
      renderSidebar({ categories: ['laptops'] });
      expect(screen.getByText('Laptops')).toBeInTheDocument();
    });
  });
});
