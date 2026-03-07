import { create } from "zustand";

const useReadingStore = create((set) => ({
  fontSize: 16,
  readerMode: false,

  increaseFont: () => set((state) => ({ fontSize: state.fontSize + 1 })),

  decreaseFont: () => set((state) => ({ fontSize: state.fontSize - 1 })),

  toggleReader: () => set((state) => ({ readerMode: !state.readerMode })),
}));

export default useReadingStore;
