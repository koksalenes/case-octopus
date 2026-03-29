import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthUser } from '@/features/auth/types/auth.types';
import { TEST_CDN_BASE_URL } from '@/test/mocks/constants';

import { UserMenu } from './UserMenu';

const mockUser: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Smith',
  gender: 'female',
  image: `${TEST_CDN_BASE_URL}/images/emily.webp`,
};

let mockOnLogout: () => void;

beforeEach(() => {
  mockOnLogout = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderUserMenu(overrides: Partial<AuthUser> = {}) {
  render(
    <UserMenu user={{ ...mockUser, ...overrides }} onLogout={mockOnLogout} />,
  );
}

const getTriggerButton = () =>
  screen.getByRole('button', { name: /emily smith/i });
const queryDropdown = () => screen.queryByRole('menu');
const getDropdown = () => screen.getByRole('menu');
const getLogoutItem = () => screen.getByRole('menuitem', { name: /logout/i });

describe('UserMenu', () => {
  describe('trigger button', () => {
    it('renders the trigger button', () => {
      renderUserMenu();
      expect(getTriggerButton()).toBeInTheDocument();
    });

    it('has aria-expanded set to false by default', () => {
      renderUserMenu();
      expect(getTriggerButton()).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-haspopup set to true', () => {
      renderUserMenu();
      expect(getTriggerButton()).toHaveAttribute('aria-haspopup', 'true');
    });
  });

  describe('avatar display', () => {
    it('renders the user avatar image when an image URL is provided', () => {
      renderUserMenu();
      expect(screen.getByAltText('Emily Smith')).toBeInTheDocument();
    });

    it('renders the initials when no image URL is provided', () => {
      renderUserMenu({ image: '' });
      expect(screen.getByText('ES')).toBeInTheDocument();
      expect(screen.queryByAltText('Emily Smith')).not.toBeInTheDocument();
    });

    it('falls back to initials when the avatar image fails to load', () => {
      renderUserMenu();
      const img = screen.getByAltText('Emily Smith');

      fireEvent.error(img);

      expect(screen.getByText('ES')).toBeInTheDocument();
    });

    it('computes correct initials from the user name', () => {
      renderUserMenu({ firstName: 'John', lastName: 'Doe', image: '' });
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('dropdown toggle', () => {
    it('does not render the dropdown initially', () => {
      renderUserMenu();
      expect(queryDropdown()).not.toBeInTheDocument();
    });

    it('opens the dropdown when the trigger is clicked', async () => {
      const user = userEvent.setup();
      renderUserMenu();

      await user.click(getTriggerButton());

      expect(getDropdown()).toBeInTheDocument();
    });

    it('sets aria-expanded to true when the dropdown is open', async () => {
      const user = userEvent.setup();
      renderUserMenu();

      await user.click(getTriggerButton());

      expect(getTriggerButton()).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes the dropdown when the trigger is clicked again', async () => {
      const user = userEvent.setup();
      renderUserMenu();

      await user.click(getTriggerButton());
      await user.click(getTriggerButton());

      expect(queryDropdown()).not.toBeInTheDocument();
    });

    it('closes the dropdown when Escape is pressed', async () => {
      const user = userEvent.setup();
      renderUserMenu();

      await user.click(getTriggerButton());
      expect(getDropdown()).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(queryDropdown()).not.toBeInTheDocument();
    });

    it('closes the dropdown when clicking outside the component', async () => {
      const user = userEvent.setup();
      renderUserMenu();

      await user.click(getTriggerButton());
      expect(getDropdown()).toBeInTheDocument();

      await user.click(document.body);

      expect(queryDropdown()).not.toBeInTheDocument();
    });
  });

  describe('logout', () => {
    it('shows the logout menu item when the dropdown is open', async () => {
      const user = userEvent.setup();
      renderUserMenu();

      await user.click(getTriggerButton());

      expect(getLogoutItem()).toBeInTheDocument();
    });

    it('calls onLogout when the logout item is clicked', async () => {
      const user = userEvent.setup();
      renderUserMenu();

      await user.click(getTriggerButton());
      await user.click(getLogoutItem());

      expect(mockOnLogout).toHaveBeenCalledOnce();
    });

    it('closes the dropdown after logout', async () => {
      const user = userEvent.setup();
      renderUserMenu();

      await user.click(getTriggerButton());
      await user.click(getLogoutItem());

      expect(queryDropdown()).not.toBeInTheDocument();
    });
  });
});
