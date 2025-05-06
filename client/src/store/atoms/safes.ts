import { atom, selectorFamily } from "recoil";
import { SafeDetails } from "@/hooks/useGetSafes";

export const safesState = atom<SafeDetails[]>({
  key: "safesState",
  default: [],
});

export const targetedSafesState = atom<SafeDetails[]>({
  key: "targetedSafesState",
  default: [],
});

export const safesLoadingState = atom<boolean>({
  key: "safesLoadingState",
  default: false,
});

export const safesErrorState = atom<Error | null>({
  key: "safesErrorState",
  default: null,
});

// Selector to get a specific safe by ID
export const safeByIdSelector = selectorFamily<SafeDetails | undefined, string>(
  {
    key: "safeByIdSelector",
    get:
      (id) =>
      ({ get }) => {
        const safes = get(safesState);
        return safes.find((safe) => safe.id.toString() === id);
      },
  }
);
