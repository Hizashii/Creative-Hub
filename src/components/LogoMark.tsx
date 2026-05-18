import type { LogoMarkProps } from "../interfaces/layout.interfaces";

export function LogoMark({ className = "h-9 w-9" }: LogoMarkProps) {
  return (
    <img
      src="/AURA.png"
      alt=""
      aria-hidden="true"
      className={`${className} shrink-0 object-contain`}
    />
  );
}
