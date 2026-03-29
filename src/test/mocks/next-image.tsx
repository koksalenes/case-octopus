import type { ImgHTMLAttributes } from 'react';

interface NextImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

const Image = ({
  src,
  alt,
  fill: _fill,
  priority: _p,
  sizes: _s,
  quality: _q,
  ...rest
}: NextImageProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} {...rest} />
);

export default Image;
