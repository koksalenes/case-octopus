import Image from 'next/image';

interface ReviewStarRatingProps {
  rating: number;
  maxStars?: number;
}

function FilledStar() {
  return (
    <Image
      src="/assets/icons/review-filled-star.svg"
      alt="Filled Star"
      width={16}
      height={16}
    />
  );
}

function EmptyStar() {
  return (
    <Image
      src="/assets/icons/review-empty-star.svg"
      alt="Empty Star"
      width={16}
      height={16}
    />
  );
}

function HalfStar() {
  return (
    <Image
      src="/assets/icons/review-half-start.svg"
      alt="Half Star"
      width={16}
      height={16}
    />
  );
}

export function ReviewStarRating({
  rating,
  maxStars = 5,
}: ReviewStarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const adjustedFull = rating - fullStars >= 0.75 ? fullStars + 1 : fullStars;
  const emptyStars = maxStars - adjustedFull - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
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
