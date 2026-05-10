import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { confirmPayment, getMovie, getShowtime, getTicket } from "@/lib/api/client";

export const Route = createFileRoute("/checkout/$orderId")({
  loader: async ({ params }) => {
    const order = await getTicket(params.orderId);
    if (!order) throw notFound();
    const showtime = await getShowtime(order.id);
    const movie = await getMovie(order.movie_code);
    return { order, showtime, movie };
  },
  head: () => ({ meta: [{ title: "Thanh toán — Lumière" }] }),
  component: CheckoutPage,
  notFoundComponent: () => <div className="p-10">Đơn hàng không tồn tại.</div>,
  errorComponent: ({ error }) => <div className="p-10">{error.message}</div>,
});

const METHODS = [
  { id: "momo", label: "Ví MoMo", desc: "Quét mã QR / mở app MoMo" },
  { id: "zalopay", label: "ZaloPay", desc: "Thanh toán bằng Zalo" },
  { id: "atm", label: "Thẻ ATM nội địa", desc: "Internet Banking" },
  { id: "visa", label: "Visa / Mastercard", desc: "Thẻ thanh toán quốc tế" },
];

function CheckoutPage() {
  const { order, showtime, movie } = Route.useLoaderData();
  const navigate = useNavigate();
  const [method, setMethod] = useState("momo");

  const pay = useMutation({
    mutationFn: () => confirmPayment(order.id),
    onSuccess: () => navigate({ to: "/tickets/$orderId", params: { orderId: order.id } }),
  });

  return (
    <div className="relative min-h-screen overflow-hidden animate-shutter-in">
      <div className="pointer-events-none absolute inset-0 -z-10">
        {movie && <img src={movie.backdrop_url} alt="" className="h-full w-full object-cover blur-3xl scale-125 opacity-30" />}
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1fr_400px]">
        <section>
          <h1 className="text-4xl font-semibold tracking-tight">Thanh toán</h1>
          <p className="mt-2 text-muted-foreground">
            Chọn phương thức thanh toán bạn muốn sử dụng. Giao dịch được xử lý an toàn.
          </p>

          <div className="mt-8 space-y-3">
            {METHODS.map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className="group relative block w-full rounded-xl border bg-card/50 p-5 text-left transition-all"
                  style={{
                    borderColor: active ? "var(--primary)" : "var(--border)",
                    boxShadow: active ? "0 0 30px -10px var(--primary)" : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium tracking-wide">{m.label}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{m.desc}</div>
                    </div>
                    <PayMonogram id={m.id} active={active} />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => pay.mutate()}
            disabled={pay.isPending}
            className="mt-8 w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform enabled:hover:scale-[1.01] disabled:opacity-50"
          >
            {pay.isPending ? "Đang xử lý thanh toán…" : `Thanh toán ${formatVnd(order.total_amount)}`}
          </button>
        </section>

        <aside className="glass-panel h-fit rounded-2xl p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tóm tắt đơn</div>
          <div className="mt-3 text-2xl font-semibold">{movie?.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {showtime && new Date(showtime.start_time).toLocaleString("vi-VN")} · {showtime?.format}
          </div>

          <div className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
            <Row label="Số ghế" value={order.seat_ids.length.toString()} />
            <Row label="Vị trí" value={order.seat_ids.join(", ")} />
            <Row label="Mã đơn" value={order.ticket_code} />
          </div>

          <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Tổng cộng</span>
            <span className="text-2xl font-semibold">{formatVnd(order.total_amount)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function PayMonogram({ id, active }: { id: string; active: boolean }) {
  const map: Record<string, string> = { momo: "M", zalopay: "Z", atm: "AT", visa: "V" };
  return (
    <span
      className="grid h-10 w-10 place-items-center rounded-md text-sm font-semibold tracking-wider transition-all"
      style={{
        background: active ? "var(--primary)" : "var(--secondary)",
        color: active ? "var(--primary-foreground)" : "var(--foreground)",
      }}
    >
      {map[id]}
    </span>
  );
}

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "₫";
}
