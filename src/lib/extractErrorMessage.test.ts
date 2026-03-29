import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';

import { extractErrorMessage } from './extractErrorMessage';

function makeAxiosError(
  message: string,
  responseData?: Record<string, unknown>,
  status = 500,
): AxiosError {
  const error = new AxiosError(
    message,
    AxiosError.ERR_BAD_RESPONSE,
    undefined,
    undefined,
    responseData
      ? ({
          data: responseData,
          status,
          statusText: 'Error',
          headers: {},
          config: {},
        } as never)
      : undefined,
  );
  return error;
}

describe('extractErrorMessage', () => {
  it('returns the server response message when present', () => {
    const error = makeAxiosError(
      'Request failed',
      { message: 'Invalid credentials' },
      401,
    );
    expect(extractErrorMessage(error, 'fallback')).toBe('Invalid credentials');
  });

  it('returns the axios message when response has no message field', () => {
    const error = makeAxiosError('Request failed with status code 500', {});
    expect(extractErrorMessage(error, 'fallback')).toBe(
      'Request failed with status code 500',
    );
  });

  it('returns the fallback when the axios error has no message', () => {
    const error = makeAxiosError('', undefined);
    expect(extractErrorMessage(error, 'Something went wrong')).toBe(
      'Something went wrong',
    );
  });

  it('returns the message for a plain Error object', () => {
    const error = new Error('raw error');
    expect(extractErrorMessage(error, 'fallback')).toBe('raw error');
  });

  it('returns the fallback for null input', () => {
    expect(extractErrorMessage(null, 'fallback')).toBe('fallback');
  });

  it('returns the fallback for undefined input', () => {
    expect(extractErrorMessage(undefined, 'fallback')).toBe('fallback');
  });

  it('prefers response.data.message over axios .message', () => {
    const error = makeAxiosError(
      'Axios level message',
      { message: 'Server says no' },
      400,
    );
    expect(extractErrorMessage(error, 'fallback')).toBe('Server says no');
  });
});
