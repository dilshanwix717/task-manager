import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

//true only after the first client render, so persisted stores are safe to read
export const useHydrated = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
