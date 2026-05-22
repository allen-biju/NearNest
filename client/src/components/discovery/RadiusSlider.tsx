import React from 'react';

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
    <div className="flex flex-col gap-4 p-4 bg-warmSurface border border-warmborder rounded-lg">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-textPrimary">
          Search Radius
        </label>
        <span className="text-lg font-bold text-primary">
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
        className="w-full h-2 bg-warmborder rounded-lg appearance-none cursor-pointer accent-primary"
      />

      {/* Quick select buttons */}
      <div className="flex gap-2 flex-wrap">
        {predefinedRadii.map((radius) => (
          <button
            key={radius}
            onClick={() => onChange(radius)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              value === radius
                ? 'bg-primary text-white'
                : 'bg-white border border-warmborder text-textSecondary hover:border-primary'
            }`}
          >
            {radius} km
          </button>
        ))}
      </div>
    </div>
  );
};

export default RadiusSlider;
