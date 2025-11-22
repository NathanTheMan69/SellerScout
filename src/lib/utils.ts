import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractListingIdFromUrl(url: string): string | null {
  // Regex to match Etsy listing IDs
  // Supports:
  // etsy.com/listing/123456/...
  // etsy.me/123456
  // https://www.etsy.com/ca/listing/123456
  const regex = /(?:etsy\.com\/(?:[a-z]{2}\/)?listing\/|etsy\.me\/)(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
