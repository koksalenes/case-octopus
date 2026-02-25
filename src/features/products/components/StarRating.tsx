import Image from 'next/image';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
}

function FilledStar() {
  return (
    <Image
      src="/assets/icons/filled-star.svg"
      alt="filled star"
      width={21}
      height={18}
    />
  );
}

function HalfStar() {
  return (
    <Image
      src="/assets/icons/half-star.svg"
      alt="half star"
      width={21}
      height={18}
    />
  );
}

function EmptyStar() {
  return (
    <Image
      src="/assets/icons/empty-star.svg"
      alt="empty star"
      width={17}
      height={17}
    />
  );
}

export function StarRating({ rating, maxStars = 5 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const adjustedFull = rating - fullStars >= 0.75 ? fullStars + 1 : fullStars;
  const emptyStars = maxStars - adjustedFull - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-end gap-1">
      {Array.from({ length: adjustedFull }, (_, i) => (
        <FilledStar key={`full-${i}`} />
      ))}
      {hasHalf && <HalfStar />}
      {Array.from({ length: Math.max(0, emptyStars) }, (_, i) => (
        <EmptyStar key={`empty-${i}`} />
      ))}
    </div>
  );
}
