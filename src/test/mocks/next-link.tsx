import type { AnchorHTMLAttributes, ReactNode } from 'react';

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: ReactNode;
  prefetch?: boolean;
}

const Link = ({ href, children, prefetch: _p, ...rest }: LinkProps) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

export default Link;
