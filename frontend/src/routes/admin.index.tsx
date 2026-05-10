import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Tổng quan</h1>
      <p className="mt-2 text-muted-foreground">
        Chào mừng trở lại. Sử dụng menu bên trái để quản lý sơ đồ phòng chiếu.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["Vé bán hôm nay", "1.284"],
          ["Doanh thu", "182M₫"],
          ["Suất chiếu hoạt động", "47"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{k}</div>
            <div className="mt-2 text-3xl font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
