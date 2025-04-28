import { atom } from "recoil";

export const availableBalanceState = atom<number>({
    key: "availableBalanceState",
    default: 0,
});

export const savingsBalanceState = atom<number>({
    key: "savingsBalanceState",
    default: 0,
});

export const totalBalanceState = atom<number>({
    key: "totalBalanceState",
    default: 0,
});

export const supportedTokensState = atom<string[]>({
    key: "supportedTokensState",
    default: [],
});

export const balancesState = atom<{available: Record<string, unknown>; total: Record<string, unknown>; savings: Record<string, unknown>;}>({
    key: "balancesState",
    default: {
        total: {},
        available: {},
        savings: {},
    },
});

export const loadingState = atom<{available: boolean, savings: boolean, total: boolean}>({
    key: "loadingState",
    default: {
        available: false,
        savings: false,
        total: false,
    },
});