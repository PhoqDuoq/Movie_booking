import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getMovie, getShowtime, getTicket } from "@/lib/api/client";

export const Route = createFileRoute("/tickets/$orderId")({
  loader: async ({ params }) => {
    const order = await getTicket(params.orderId);
    if (!order) throw notFound();
    const showtime = await getShowtime(order.id);
    const movie = await getMovie(order.movie_code);
    return { order, showtime, movie };
  },
  head: () => ({ meta: [{ title: "Vé của bạn — Lumière" }] }),
  component: TicketPage,
  notFoundComponent: () => <div className="p-10">Vé không tồn tại.</div>,
  errorComponent: ({ error }) => <div className="p-10">{error.message}</div>,
});

function TicketPage() {
  const { order, showtime, movie } = Route.useLoaderData();
  const [particles] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      d: Math.random() * 1.5,
      s: 2 + Math.random() * 4,
    })),
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Particle confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute block rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.s,
              height: p.s,
              background: ["var(--primary)", "var(--gold)", "oklch(0.7 0.18 200)"][p.id % 3],
              opacity: 0,
              animation: `particle-pop 2.4s ${p.d}s ease-out forwards`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes particle-pop {
          0% { opacity: 0; transform: translateY(0) scale(0.6); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-180px) scale(1.1); }
        }
      `}</style>

      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Đặt vé thành công
        </div>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">Hẹn gặp tại rạp</h1>
        <p className="mt-3 text-muted-foreground">
          Vui lòng xuất trình mã QR dưới đây tại quầy hoặc cổng soát vé.
        </p>

        {/* Flip ticket */}
        <div className="mx-auto mt-12" style={{ perspective: "1200px" }}>
          <div
            className="glass-panel mx-auto max-w-md overflow-hidden rounded-3xl text-left"
            style={{ animation: "flip-ticket 0.9s cubic-bezier(0.2,0.8,0.2,1) forwards", transformStyle: "preserve-3d" }}
          >
            <div className="relative">
              {movie && (
                <img src={movie.backdrop_url} alt="" className="h-32 w-full object-cover opacity-70" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              <div className="absolute bottom-3 left-5 text-lg font-semibold">{movie?.title}</div>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-6 p-6">
              <dl className="space-y-3 text-sm">
                <Row label="Mã vé" value={order.ticket_code} />
                <Row label="Suất chiếu" value={showtime ? new Date(showtime.start_time).toLocaleString("vi-VN") : ""} />
                <Row label="Phòng" value={showtime?.room_id ?? ""} />
                <Row label="Ghế" value={order.seat_ids.join(", ")} />
                <Row label="Định dạng" value={showtime?.format ?? ""} />
              </dl>
              <div className="rounded-xl bg-white p-3">
                <QRCodeSVG value={order.id} size={120} />
              </div>
            </div>
            {/* Tear notch */}
            <div className="relative h-px bg-border">
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-background" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-background" />
            </div>
            <div className="flex items-center justify-between p-6 text-sm">
              <span className="text-muted-foreground">Tổng thanh toán</span>
              <span className="text-xl font-semibold">{order.total_amount.toLocaleString("vi-VN")}₫</span>
            </div>
          </div>
        </div>

        <Link
          to="/"
          className="mt-12 inline-block rounded-full border border-border px-6 py-3 text-sm transition-colors hover:bg-secondary"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
