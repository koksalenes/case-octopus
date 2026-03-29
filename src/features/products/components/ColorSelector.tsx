'use client';

import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface ColorOption {
  name: string;
  color: string;
}

interface ColorSelectorProps {
  colors: ColorOption[];
  defaultSelected?: string;
}

export function ColorSelector({ colors, defaultSelected }: ColorSelectorProps) {
  const [selected, setSelected] = useState(
    defaultSelected ?? colors[0]?.name ?? '',
  );

  return (
    <div className="flex flex-col gap-2.25">
      <h3 className="font-heading text-base leading-[137.5%] font-bold text-black">
        Select Color:
      </h3>

      <div className="flex flex-wrap gap-5">
        {colors.map((color) => {
          const isSelected = selected === color.name;
          return (
            <button
              key={color.name}
              onClick={() => setSelected(color.name)}
              className={cn(
                'relative flex h-11.25 w-36.25 items-center gap-2 px-5 transition-shadow',
                isSelected
                  ? 'bg-white shadow-[0px_5px_10px_rgba(0,0,0,0.1)]'
                  : 'border-selector-inactive border-[0.5px]',
              )}
            >
              <span
                className="h-[19.36px] w-[19.36px] shrink-0 rounded-full"
                style={{ backgroundColor: color.color }}
              />
              <span
                className={cn(
                  'font-heading text-[14.08px] leading-[137.5%]',
                  isSelected ? 'text-black' : 'text-selector-inactive',
                )}
              >
                {color.name}
              </span>

              {isSelected && (
                <span className="bg-primary ml-auto flex h-4.75 w-4.75 shrink-0 items-center justify-center rounded-full">
                  <Image
                    src="/assets/icons/check.svg"
                    alt="selected"
                    width={12}
                    height={12}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
