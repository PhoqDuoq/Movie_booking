import { create } from "zustand";
import { lockSeat, unlockSeat } from "./api/client";

const USER_ID = "USR-0001";
const TTL_SECONDS = 600; // 10 minutes

type State = {
  showtimeId: string | null;
  selectedSeats: string[];
  expiresAt: number | null; // epoch ms
  toggleSeat: (showtimeId: string, seatId: string) => Promise<void>;
  reset: () => void;
};

export const useSeatLock = create<State>((set, get) => ({
  showtimeId: null,
  selectedSeats: [],
  expiresAt: null,

  toggleSeat: async (showtimeId, seatId) => {
    const state = get();
    const sameShow = state.showtimeId === showtimeId;
    const current = sameShow ? state.selectedSeats : [];
    const isSelected = current.includes(seatId);

    if (isSelected) {
      await unlockSeat({ showtime_id: showtimeId, seat_id: seatId, user_id: USER_ID });
      const next = current.filter((s) => s !== seatId);
      set({
        showtimeId,
        selectedSeats: next,
        expiresAt: next.length === 0 ? null : state.expiresAt,
      });
    } else {
      await lockSeat({ showtime_id: showtimeId, seat_id: seatId, user_id: USER_ID });
      const next = [...current, seatId];
      set({
        showtimeId,
        selectedSeats: next,
        // start countdown on first pick; refresh on each new pick
        expiresAt: Date.now() + TTL_SECONDS * 1000,
      });
    }
  },

  reset: () => set({ showtimeId: null, selectedSeats: [], expiresAt: null }),
}));

export { TTL_SECONDS };
