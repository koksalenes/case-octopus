import { describe, expect, it } from 'vitest';

import { formatPrice } from './product.utils';

describe('formatPrice', () => {
  it('formats a whole number with two decimal places', () => {
    expect(formatPrice(999)).toBe('$999.00');
  });

  it('formats a decimal value correctly', () => {
    expect(formatPrice(19.99)).toBe('$19.99');
  });

  it('formats zero as $0.00', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('does not use grouping separators for thousands', () => {
    expect(formatPrice(1999)).toBe('$1999.00');
    expect(formatPrice(10000)).toBe('$10000.00');
  });

  it('pads a single decimal digit to two places', () => {
    expect(formatPrice(9.9)).toBe('$9.90');
  });

  it('rounds to two decimal places', () => {
    expect(formatPrice(1.005)).toBe('$1.01');
  });

  it('formats a price with exactly two decimal digits unchanged', () => {
    expect(formatPrice(49.95)).toBe('$49.95');
  });

  it('formats a large price without comma separators', () => {
    expect(formatPrice(99999)).toBe('$99999.00');
  });
});
