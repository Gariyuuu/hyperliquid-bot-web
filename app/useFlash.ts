import { useEffect, useRef, useState } from "react";

// Tracks whether a numeric value just increased or decreased since its last
// render, for a purely decorative "this just changed" flash -- never used to
// gate what's displayed, since the caller always renders the real value
// immediately regardless of this hook's output.
export function useFlash(value: number): "up" | "down" | null {
  const prevRef = useRef(value);
  const [dir, setDir] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (value > prevRef.current) setDir("up");
    else if (value < prevRef.current) setDir("down");
    else setDir(null);
    prevRef.current = value;
  }, [value]);

  return dir;
}
