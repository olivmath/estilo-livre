import { cn } from "@/lib/utils"

function Slider({ min = 0, max = 100, step = 1, value, onValueChange, className, style }) {
  const current = Array.isArray(value) ? value[0] : (value ?? min);

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={current}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
      className={cn("w-full cursor-pointer", className)}
      style={{ accentColor: "var(--acc)", height: 20, ...style }}
    />
  );
}

export { Slider }
