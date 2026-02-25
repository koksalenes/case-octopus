'use client';

import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface FeatureOption {
  id: string;
  title: string;
  description: string;
}

interface FeatureSelectorProps {
  features: FeatureOption[];
  defaultSelectedId?: string;
}

export function FeatureSelector({
  features,
  defaultSelectedId,
}: FeatureSelectorProps) {
  const [selectedId, setSelectedId] = useState(
    defaultSelectedId ?? features[0]?.id ?? '',
  );

  return (
    <div className="flex flex-col gap-2.25">
      <h3 className="font-heading text-base leading-[137.5%] font-bold text-black">
        Select Feature:
      </h3>

      <div className="grid w-full max-w-100 grid-cols-1 gap-x-2.5 gap-y-2.5 sm:max-w-none sm:grid-cols-2">
        {features.map((feature) => {
          const isSelected = selectedId === feature.id;
          return (
            <button
              key={feature.id}
              onClick={() => setSelectedId(feature.id)}
              className={cn(
                'relative flex h-25 w-full flex-col justify-center px-2.5 py-2.5 text-left transition-shadow',
                isSelected
                  ? 'bg-white shadow-[0px_5px_10px_rgba(0,0,0,0.1)]'
                  : 'border-[0.5px] border-[#C0C0C0]',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-heading text-[14.08px] leading-[137.5%] font-medium',
                    isSelected ? 'text-black' : 'text-[#8D8D8D]',
                  )}
                >
                  {feature.title}
                </span>
                {isSelected && (
                  <span className="flex h-4.75 w-4.75 shrink-0 items-center justify-center rounded-full bg-[#00B512]">
                    <Image
                      src="/assets/icons/check.svg"
                      alt="selected"
                      width={12}
                      height={12}
                    />
                  </span>
                )}
              </div>
              <p
                className={cn(
                  'font-heading mt-1 text-[14.08px] font-medium',
                  isSelected
                    ? 'leading-[105%] text-[#1E1E21]'
                    : 'leading-[137.5%] text-[#C0C0C0]',
                )}
              >
                {feature.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
