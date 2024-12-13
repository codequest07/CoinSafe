import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getValidNumberValue(value: any) {
  return typeof value === "number" && !isNaN(value) ? value : 0;
}

export function getPercentage(a: number, b: number) {
  return (a/b * 100).toFixed();
}