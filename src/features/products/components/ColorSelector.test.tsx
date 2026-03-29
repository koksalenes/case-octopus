import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ColorSelector } from './ColorSelector';

const mockColors = [
  { name: 'Black', color: '#000000' },
  { name: 'White', color: '#FFFFFF' },
  { name: 'Blue', color: '#0000FF' },
];

afterEach(() => {
  vi.clearAllMocks();
});

function renderColorSelector(defaultSelected?: string) {
  render(
    <ColorSelector colors={mockColors} defaultSelected={defaultSelected} />,
  );
}

const getHeading = () => screen.getByRole('heading', { name: /select color/i });
const getColorButton = (name: string) =>
  screen.getByRole('button', { name: new RegExp(name, 'i') });
const queryCheckmark = () => screen.queryByAltText('selected');
const queryAllCheckmarks = () => screen.queryAllByAltText('selected');

describe('ColorSelector', () => {
  describe('initial render', () => {
    it('renders the "Select Color:" heading', () => {
      renderColorSelector();
      expect(getHeading()).toBeInTheDocument();
    });

    it('renders a button for every color option', () => {
      renderColorSelector();
      mockColors.forEach(({ name }) => {
        expect(getColorButton(name)).toBeInTheDocument();
      });
    });

    it('selects the first color by default when no defaultSelected is provided', () => {
      renderColorSelector();
      const checkmark = queryCheckmark();
      expect(checkmark).toBeInTheDocument();
      expect(getColorButton('Black')).toContainElement(checkmark);
    });

    it('honors the defaultSelected prop', () => {
      renderColorSelector('White');
      const checkmark = queryCheckmark();
      expect(checkmark).toBeInTheDocument();
      expect(getColorButton('White')).toContainElement(checkmark);
    });

    it('does not show a checkmark on non-selected colors', () => {
      renderColorSelector('Black');
      expect(queryAllCheckmarks()).toHaveLength(1);
    });
  });

  describe('selection behavior', () => {
    it('moves the checkmark to the clicked color', async () => {
      const user = userEvent.setup();
      renderColorSelector();

      await user.click(getColorButton('Blue'));

      const checkmark = queryCheckmark();
      expect(getColorButton('Blue')).toContainElement(checkmark);
    });

    it('removes the checkmark from the previously selected color', async () => {
      const user = userEvent.setup();
      renderColorSelector();

      await user.click(getColorButton('White'));

      expect(getColorButton('Black')).not.toContainElement(queryCheckmark());
    });

    it('only ever shows one checkmark at a time', async () => {
      const user = userEvent.setup();
      renderColorSelector();

      await user.click(getColorButton('Blue'));

      expect(queryAllCheckmarks()).toHaveLength(1);
    });

    it('re-selecting the current color keeps it selected', async () => {
      const user = userEvent.setup();
      renderColorSelector('White');

      await user.click(getColorButton('White'));

      expect(getColorButton('White')).toContainElement(queryCheckmark());
    });
  });

  describe('color circle', () => {
    it('renders a colored circle for each option', () => {
      renderColorSelector();
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        const circle = button.querySelector('span[style]');
        expect(circle).toBeInTheDocument();
      });
    });
  });
});
