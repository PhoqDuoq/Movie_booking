import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Lumière Admin" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="light-admin -mt-20 min-h-screen bg-background pt-20 text-foreground">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <aside className="w-56 shrink-0">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Quản trị</div>
          <nav className="mt-4 space-y-1 text-sm">
            <NavItem to="/admin" label="Tổng quan" exact />
            <NavItem to="/admin/rooms/$roomId/layout" params={{ roomId: "ROOM-01-THT-0001" }} label="Sơ đồ phòng chiếu" />
          </nav>
        </aside>
        <section className="min-h-[80vh] flex-1 rounded-2xl border bg-card p-8 shadow-sm">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

function NavItem({
  to,
  label,
  exact,
  params,
}: {
  to: string;
  label: string;
  exact?: boolean;
  params?: Record<string, string>;
}) {
  return (
    <Link
      to={to as never}
      params={params as never}
      activeOptions={{ exact }}
      activeProps={{ className: "bg-secondary text-foreground" }}
      className="block rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
    >
      {label}
    </Link>
  );
}
