import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  token: string;
  email: string;
  name: string;
  id: number | undefined;
};

type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserStore>(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: "user-storage",
    }
  ) as StateCreator<UserStore>
);
