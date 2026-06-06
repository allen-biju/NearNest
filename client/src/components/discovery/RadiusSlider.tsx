import React from 'react';
import { motion } from 'framer-motion';

interface RadiusSliderProps {
  value: number;
  onChange: (radius: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const RadiusSlider: React.FC<RadiusSliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 20,
  step = 1
}) => {
  const predefinedRadii = [1, 3, 5, 10, 20];

  return (
    <div className="flex flex-col gap-4.5 p-5 bg-white border border-warmborder rounded-[24px] shadow-sm">
      <div className="flex justify-between items-center">
        <label className="text-xs font-black uppercase tracking-wider text-textSecondary">
          Search Radius
        </label>
        <span className="text-base font-black text-primary font-mono bg-primary/5 px-2.5 py-0.5 rounded-lg">
          {value} km
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-warmborder rounded-lg appearance-none cursor-pointer accent-primary"
      />

      {/* Quick select buttons */}
      <div className="flex gap-2 flex-wrap pt-1 border-t border-dotted border-warmborder/80">
        {predefinedRadii.map((radius) => {
          const isActive = value === radius;
          return (
            <motion.button
              key={radius}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(radius)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 border ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-textSecondary border-warmborder hover:border-primary/55'
              }`}
            >
              {radius} km
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default RadiusSlider;
