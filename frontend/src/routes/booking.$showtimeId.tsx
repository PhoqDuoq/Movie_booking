import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { checkout, getMovie, getSeatMap, getShowtime } from "@/lib/api/client";
import { useSeatLock } from "@/lib/seat-lock-store";
import type { Seat } from "@/lib/api/types";

export const Route = createFileRoute("/booking/$showtimeId")({
  loader: async ({ params }) => {
    const showtime = await getShowtime(params.showtimeId);
    if (!showtime) throw notFound();
    const movie = await getMovie(showtime.movie_id);
    if (!movie) throw notFound();
    return { showtime, movie };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Chọn ghế — ${loaderData?.movie.title ?? "Lumière"}` },
      { name: "description", content: "Chọn vị trí ghế ngồi cho suất chiếu của bạn." },
    ],
  }),
  component: BookingPage,
  notFoundComponent: () => <div className="p-10">Suất chiếu không tồn tại.</div>,
  errorComponent: ({ error }) => <div className="p-10">{error.message}</div>,
});

function BookingPage() {
  const { showtime, movie } = Route.useLoaderData();
  const navigate = useNavigate();
  const { data: seatMap } = useQuery({
    queryKey: ["seats", showtime.id],
    queryFn: () => getSeatMap(showtime.id),
  });

  const { selectedSeats, expiresAt, toggleSeat, reset } = useSeatLock();
  useEffect(() => () => reset(), [reset]);

  const checkoutMutation = useMutation({
    mutationFn: () =>
      checkout({ showtime_id: showtime.id, seat_ids: selectedSeats, combos: [] }),
    onSuccess: ({ order_id }) => {
      navigate({ to: "/checkout/$orderId", params: { orderId: order_id } });
    },
  });

  const total = selectedSeats.reduce((sum, sid) => {
    const seat = seatMap?.seats.find((s) => s.id === sid);
    return sum + (seat?.price ?? 0);
  }, 0);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Blurred poster background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <img src={movie.backdrop_url} alt="" className="h-full w-full object-cover blur-3xl scale-125 opacity-40" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="film-grain-overlay" />
      </div>

      {/* Countdown bar */}
      <Countdown expiresAt={expiresAt} />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {showtime.format} · {new Date(showtime.start_time).toLocaleString("vi-VN")}
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{movie.title}</h1>
        </div>

        <Screen />

        {seatMap && <SeatGrid seatMap={seatMap} onPick={(s) => toggleSeat(showtime.id, s.id)} selected={selectedSeats} />}

        <Legend />
      </div>

      {/* Footer cart bar */}
      <div className="sticky bottom-0 z-20 mt-10">
        <div className="glass-panel mx-auto flex max-w-6xl items-center justify-between rounded-t-2xl px-6 py-5">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {selectedSeats.length} ghế đã chọn
            </div>
            <div className="mt-1 text-sm">
              {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn ghế nào"}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tạm tính</div>
              <div className="text-xl font-semibold">{formatVnd(total)}</div>
            </div>
            <button
              disabled={selectedSeats.length === 0 || checkoutMutation.isPending}
              onClick={() => checkoutMutation.mutate()}
              className="rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform enabled:hover:scale-[1.03] disabled:opacity-40"
            >
              {checkoutMutation.isPending ? "Đang tạo đơn…" : "Tiếp tục thanh toán"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Countdown({ expiresAt }: { expiresAt: number | null }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  if (!expiresAt) return null;
  const remain = Math.max(0, expiresAt - now);
  const pct = (remain / (10 * 60 * 1000)) * 100;
  const mm = String(Math.floor(remain / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remain % 60000) / 1000)).padStart(2, "0");
  const danger = pct < 25;
  return (
    <div className="fixed top-16 left-0 right-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-2 text-xs">
        <span className="text-muted-foreground">Giữ ghế</span>
        <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: danger
                ? "linear-gradient(90deg, oklch(0.7 0.22 30), oklch(0.6 0.24 27))"
                : "linear-gradient(90deg, oklch(0.7 0.18 160), oklch(0.6 0.2 200))",
            }}
          />
        </div>
        <span className={danger ? "text-destructive font-medium" : "text-muted-foreground"}>
          {mm}:{ss}
        </span>
      </div>
    </div>
  );
}

function Screen() {
  return (
    <div className="mb-12 flex flex-col items-center">
      <svg viewBox="0 0 600 60" className="w-full max-w-3xl">
        <defs>
          <linearGradient id="screenGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.14 85)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="oklch(0.85 0.14 85)" stopOpacity="0" />
          </linearGradient>
          <filter id="blur"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <path d="M 30 10 Q 300 -20 570 10" stroke="oklch(0.85 0.14 85)" strokeWidth="2" fill="none" />
        <path d="M 30 10 Q 300 -20 570 10 L 600 60 L 0 60 Z" fill="url(#screenGlow)" filter="url(#blur)" opacity="0.45" />
      </svg>
      <div className="mt-1 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Màn hình</div>
    </div>
  );
}

function SeatGrid({
  seatMap,
  selected,
  onPick,
}: {
  seatMap: { rows: string[]; cols: number; seats: Seat[] };
  selected: string[];
  onPick: (s: Seat) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      {seatMap.rows.map((row) => (
        <div key={row} className="flex items-center justify-center gap-1.5 my-1.5">
          <span className="w-6 text-center text-[10px] text-muted-foreground">{row}</span>
          {Array.from({ length: seatMap.cols }, (_, i) => i + 1).map((col) => {
            const seat = seatMap.seats.find((s) => s.row_name === row && s.seat_number === col)!;
            const isSelected = selected.includes(seat.id);
            const isAisle = col === 7; // visual aisle gap
            return (
              <div key={seat.id} className="flex items-center">
                <SeatButton seat={seat} selected={isSelected} onClick={() => onPick(seat)} />
                {isAisle && <span className="w-3" />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SeatButton({
  seat,
  selected,
  onClick,
}: {
  seat: Seat;
  selected: boolean;
  onClick: () => void;
}) {
  const sold = seat.status === "SOLD";
  const vip = seat.seat_type === "VIP";
  return (
    <button
      onClick={onClick}
      disabled={sold}
      aria-label={`Ghế ${seat.id}`}
      className="relative h-7 w-7 rounded-md transition-all"
      style={{
        background: sold
          ? "var(--seat-sold)"
          : selected
            ? "var(--seat-selected)"
            : vip
              ? "transparent"
              : "var(--seat-available)",
        border: vip && !selected && !sold ? "1px solid var(--gold)" : "none",
        opacity: sold ? 0.35 : 1,
        boxShadow: selected ? "0 0 16px -2px var(--primary)" : undefined,
        animation: selected ? "scale-pulse 0.4s ease-out" : undefined,
        cursor: sold ? "not-allowed" : "pointer",
      }}
    />
  );
}

function Legend() {
  const items: [string, string, string?][] = [
    ["Trống", "var(--seat-available)"],
    ["Đang chọn", "var(--seat-selected)"],
    ["VIP", "transparent", "1px solid var(--gold)"],
    ["Đã bán", "var(--seat-sold)"],
  ];
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
      {items.map(([label, bg, border]) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 rounded"
            style={{ background: bg, border: border ?? "none" }}
          />
          {label}
        </div>
      ))}
    </div>
  );
}

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "₫";
}
