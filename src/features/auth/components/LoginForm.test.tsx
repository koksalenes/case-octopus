import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useRouter } from 'next/navigation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_API_BASE_URL } from '@/test/mocks/constants';
import { mockUser } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/render-utils';

import { LoginForm } from './LoginForm';

const mockPush = vi.fn();

beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  });
  localStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderLoginForm() {
  return renderWithProviders(<LoginForm />);
}

const getUsernameInput = () =>
  screen.getByRole('textbox', { name: /username/i });
const getPasswordInput = () => screen.getByLabelText(/enter your password/i);
const getLoginButton = () => screen.getByRole('button', { name: /login/i });
const getRememberMeCheckbox = () =>
  screen.getByRole('checkbox', { name: /remember me/i });
const getShowPasswordToggle = () =>
  screen.getByRole('button', { name: /show password/i });
const queryApiError = () => screen.queryByRole('alert');

describe('LoginForm', () => {
  describe('rendering', () => {
    it('renders the username field, password field, and login button', () => {
      renderLoginForm();
      expect(getUsernameInput()).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(getLoginButton()).toBeInTheDocument();
    });

    it('renders the "Remember me" checkbox unchecked by default', () => {
      renderLoginForm();
      expect(getRememberMeCheckbox()).toHaveAttribute('aria-checked', 'false');
    });

    it('shows the "Remember me?" label text', () => {
      renderLoginForm();
      expect(screen.getByText(/remember me\?/i)).toBeInTheDocument();
    });

    it('pre-fills the username from stored credentials', () => {
      localStorage.setItem(
        'remember_me',
        JSON.stringify({ username: 'emilys' }),
      );
      renderLoginForm();
      expect(getUsernameInput()).toHaveValue('emilys');
    });

    it('checks the Remember Me checkbox when stored credentials exist', () => {
      localStorage.setItem(
        'remember_me',
        JSON.stringify({ username: 'emilys' }),
      );
      renderLoginForm();
      expect(getRememberMeCheckbox()).toHaveAttribute('aria-checked', 'true');
    });

    it('does not show an API error on initial render', () => {
      renderLoginForm();
      expect(queryApiError()).not.toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('shows a validation error when the username is empty on submit', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.click(getLoginButton());

      expect(
        await screen.findByText(/username is required/i),
      ).toBeInTheDocument();
    });

    it('shows a validation error when the password is empty on submit', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.type(getUsernameInput(), 'emilys');
      await user.click(getLoginButton());

      expect(
        await screen.findByText(/password is required/i),
      ).toBeInTheDocument();
    });

    it('clears the username validation error when the user starts typing', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.click(getLoginButton());
      expect(
        await screen.findByText(/username is required/i),
      ).toBeInTheDocument();

      await user.type(getUsernameInput(), 'e');
      expect(
        screen.queryByText(/username is required/i),
      ).not.toBeInTheDocument();
    });

    it('clears the password validation error when the user starts typing', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.type(getUsernameInput(), 'emilys');
      await user.click(getLoginButton());
      expect(
        await screen.findByText(/password is required/i),
      ).toBeInTheDocument();

      await user.type(getPasswordInput(), 'e');
      expect(
        screen.queryByText(/password is required/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('password visibility', () => {
    it('renders the "Show password" toggle button', () => {
      renderLoginForm();
      expect(getShowPasswordToggle()).toBeInTheDocument();
    });

    it('reveals the password when the toggle is clicked', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.type(getPasswordInput(), 'secret');
      await user.click(getShowPasswordToggle());

      expect(
        screen.getByRole('button', { name: /hide password/i }),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('secret')).toBeInTheDocument();
    });

    it('hides the password again when the toggle is clicked a second time', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.click(getShowPasswordToggle());
      await user.click(screen.getByRole('button', { name: /hide password/i }));

      expect(getShowPasswordToggle()).toBeInTheDocument();
    });
  });

  describe('successful login', () => {
    it('redirects to /products after a successful login', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.type(getUsernameInput(), 'emilys');
      await user.type(getPasswordInput(), 'emilyspass');
      await user.click(getLoginButton());

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/products'));
    });

    it('saves credentials when "Remember me" is checked', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      await user.click(getRememberMeCheckbox());
      await user.type(getUsernameInput(), 'emilys');
      await user.type(getPasswordInput(), 'emilyspass');
      await user.click(getLoginButton());

      await waitFor(() => {
        const stored = localStorage.getItem('remember_me');
        expect(stored).not.toBeNull();
        expect(JSON.parse(stored!).username).toBe('emilys');
      });
    });

    it('clears stored credentials when "Remember me" is unchecked', async () => {
      localStorage.setItem(
        'remember_me',
        JSON.stringify({ username: 'emilys' }),
      );
      const user = userEvent.setup();
      renderLoginForm();

      expect(getRememberMeCheckbox()).toHaveAttribute('aria-checked', 'true');
      await user.click(getRememberMeCheckbox());

      await user.type(getPasswordInput(), 'emilyspass');
      await user.click(getLoginButton());

      await waitFor(() =>
        expect(localStorage.getItem('remember_me')).toBeNull(),
      );
    });
  });

  describe('failed login', () => {
    it('shows an API error message when the server returns 401', async () => {
      server.use(
        http.post(`${TEST_API_BASE_URL}/auth/login`, () =>
          HttpResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 },
          ),
        ),
      );

      const user = userEvent.setup();
      renderLoginForm();

      await user.type(getUsernameInput(), 'bad');
      await user.type(getPasswordInput(), 'bad');
      await user.click(getLoginButton());

      expect(await screen.findByRole('alert')).toBeInTheDocument();
      expect(
        await screen.findByText(/invalid credentials/i),
      ).toBeInTheDocument();
    });

    it('does not navigate when login fails', async () => {
      server.use(
        http.post(`${TEST_API_BASE_URL}/auth/login`, () =>
          HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
        ),
      );

      const user = userEvent.setup();
      renderLoginForm();

      await user.type(getUsernameInput(), 'bad');
      await user.type(getPasswordInput(), 'bad');
      await user.click(getLoginButton());

      await screen.findByText(/unauthorized/i);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('disables the login button while the request is in flight', async () => {
      let resolveRequest!: () => void;
      server.use(
        http.post(
          `${TEST_API_BASE_URL}/auth/login`,
          () =>
            new Promise<Response>((resolve) => {
              resolveRequest = () => resolve(HttpResponse.json(mockUser));
            }),
        ),
      );

      const user = userEvent.setup();
      renderLoginForm();

      await user.type(getUsernameInput(), 'emilys');
      await user.type(getPasswordInput(), 'emilyspass');
      await user.click(getLoginButton());

      expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();

      resolveRequest();
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/products'));
    });
  });
});
