"use client";
import { useRouter } from "next/navigation";

// Define the interface for the useHook
export interface UsePathLookupHook {
  match: (path: string) => boolean; // match method that accepts a path parameter and returns a boolean
  lookup: React.ReactNode;
}

// Example implementation of the hook
export const useExampleHook = (): UsePathLookupHook => {

  const router = useRouter();

  const match = (inputPath: string): boolean => {
    return false
  };

  const lookup = (
    <div />
  );

  return {
    lookup,
    match,
  };
};
