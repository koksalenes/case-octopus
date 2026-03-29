import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FeatureSelector } from './FeatureSelector';

const mockFeatures = [
  { id: 'wireless', title: 'Wireless', description: 'No cables needed' },
  { id: 'wired', title: 'Wired', description: 'Reliable connection' },
  { id: 'hybrid', title: 'Hybrid', description: 'Best of both worlds' },
];

afterEach(() => {
  vi.clearAllMocks();
});

function renderFeatureSelector(defaultSelectedId?: string) {
  render(
    <FeatureSelector
      features={mockFeatures}
      defaultSelectedId={defaultSelectedId}
    />,
  );
}

const getHeading = () =>
  screen.getByRole('heading', { name: /select feature/i });
const getFeatureButton = (title: string) =>
  screen.getByRole('button', { name: new RegExp(title, 'i') });
const queryCheckmark = () => screen.queryByAltText('selected');
const queryAllCheckmarks = () => screen.queryAllByAltText('selected');

describe('FeatureSelector', () => {
  describe('initial render', () => {
    it('renders the "Select Feature:" heading', () => {
      renderFeatureSelector();
      expect(getHeading()).toBeInTheDocument();
    });

    it('renders a button for every feature option', () => {
      renderFeatureSelector();
      mockFeatures.forEach(({ title }) => {
        expect(getFeatureButton(title)).toBeInTheDocument();
      });
    });

    it('renders the description text for each feature', () => {
      renderFeatureSelector();
      mockFeatures.forEach(({ description }) => {
        expect(screen.getByText(description)).toBeInTheDocument();
      });
    });

    it('selects the first feature by default when no defaultSelectedId is provided', () => {
      renderFeatureSelector();
      const checkmark = queryCheckmark();
      expect(checkmark).toBeInTheDocument();
      expect(getFeatureButton('Wireless')).toContainElement(checkmark);
    });

    it('honors the defaultSelectedId prop', () => {
      renderFeatureSelector('wired');
      const checkmark = queryCheckmark();
      expect(checkmark).toBeInTheDocument();
      expect(getFeatureButton('Wired')).toContainElement(checkmark);
    });

    it('does not show a checkmark on non-selected features', () => {
      renderFeatureSelector('wireless');
      expect(queryAllCheckmarks()).toHaveLength(1);
    });
  });

  describe('selection behavior', () => {
    it('moves the checkmark to the clicked feature', async () => {
      const user = userEvent.setup();
      renderFeatureSelector();

      await user.click(getFeatureButton('Hybrid'));

      const checkmark = queryCheckmark();
      expect(getFeatureButton('Hybrid')).toContainElement(checkmark);
    });

    it('removes the checkmark from the previously selected feature', async () => {
      const user = userEvent.setup();
      renderFeatureSelector();

      await user.click(getFeatureButton('Wired'));

      expect(getFeatureButton('Wireless')).not.toContainElement(
        queryCheckmark(),
      );
    });

    it('only ever shows one checkmark at a time', async () => {
      const user = userEvent.setup();
      renderFeatureSelector();

      await user.click(getFeatureButton('Hybrid'));

      expect(queryAllCheckmarks()).toHaveLength(1);
    });

    it('re-selecting the current feature keeps it selected', async () => {
      const user = userEvent.setup();
      renderFeatureSelector('wired');

      await user.click(getFeatureButton('Wired'));

      expect(getFeatureButton('Wired')).toContainElement(queryCheckmark());
    });

    it('cycles through all features correctly', async () => {
      const user = userEvent.setup();
      renderFeatureSelector();

      for (const { title } of mockFeatures) {
        await user.click(getFeatureButton(title));
        expect(getFeatureButton(title)).toContainElement(queryCheckmark());
        expect(queryAllCheckmarks()).toHaveLength(1);
      }
    });
  });
});
