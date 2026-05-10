import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { RoomCellType, RoomLayoutCell } from "@/lib/api/types";

export const Route = createFileRoute("/admin/rooms/$roomId/layout")({
  head: () => ({ meta: [{ title: "Thiết kế sơ đồ phòng — Lumière Admin" }] }),
  component: LayoutEditor,
});

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
const COLS = 14;
type Tool = "normal" | "vip" | "couple" | "aisle" | "erase";

const TOOLS: { id: Tool; label: string; cursor: string }[] = [
  { id: "normal", label: "Ghế thường", cursor: "crosshair" },
  { id: "vip", label: "Ghế VIP", cursor: "copy" },
  { id: "couple", label: "Ghế đôi", cursor: "cell" },
  { id: "aisle", label: "Lối đi", cursor: "col-resize" },
  { id: "erase", label: "Xóa", cursor: "not-allowed" },
];

function defaultGrid(): Record<string, RoomCellType> {
  const g: Record<string, RoomCellType> = {};
  ROWS.forEach((r) => {
    for (let c = 1; c <= COLS; c++) {
      g[`${r}-${c}`] = "normal";
    }
  });
  return g;
}

function LayoutEditor() {
  const { roomId } = Route.useParams();
  const [tool, setTool] = useState<Tool>("normal");
  const [grid, setGrid] = useState<Record<string, RoomCellType>>(defaultGrid);
  const [drag, setDrag] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const apply = (key: string) => {
    setGrid((g) => ({ ...g, [key]: tool === "erase" ? "empty" : tool }));
  };

  const save = () => {
    const payload: RoomLayoutCell[] = Object.entries(grid).map(([key, type]) => {
      const [row, c] = key.split("-");
      return { row, col: Number(c), type, status: type === "empty" ? "disabled" : "active" };
    });
    // POST /api/v1/admin/rooms/{roomId}/layouts
    console.log("save layout", roomId, payload);
    setSaved(new Date().toLocaleTimeString("vi-VN"));
    setTimeout(() => setSaved(null), 2500);
  };

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Sơ đồ phòng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Phòng <span className="font-medium text-foreground">{roomId}</span> · Kéo để chọn nhiều ô
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-muted-foreground">Đã lưu lúc {saved}</span>}
          <button
            onClick={save}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Lưu sơ đồ
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className="rounded-md border px-3 py-1.5 text-sm transition-colors"
            style={{
              borderColor: tool === t.id ? "var(--primary)" : "var(--border)",
              background: tool === t.id ? "var(--primary)" : "transparent",
              color: tool === t.id ? "var(--primary-foreground)" : "var(--foreground)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex gap-6">
        {/* Canvas */}
        <div
          className="relative flex-1 overflow-auto rounded-xl border bg-background p-6"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            cursor: TOOLS.find((t) => t.id === tool)?.cursor,
          }}
          onMouseUp={() => setDrag(false)}
          onMouseLeave={() => setDrag(false)}
        >
          <div className="mb-4 text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            Màn hình
          </div>
          <div className="mx-auto h-px max-w-md bg-foreground/20" />
          <div className="mt-8 inline-block">
            {ROWS.map((row) => (
              <div key={row} className="flex items-center gap-1 my-1">
                <span className="w-6 text-center text-[10px] text-muted-foreground">{row}</span>
                {Array.from({ length: COLS }, (_, i) => i + 1).map((col) => {
                  const key = `${row}-${col}`;
                  const type = grid[key];
                  return (
                    <button
                      key={key}
                      onMouseDown={() => {
                        setDrag(true);
                        apply(key);
                        setSelected(key);
                      }}
                      onMouseEnter={() => drag && apply(key)}
                      onClick={() => setSelected(key)}
                      className="h-6 w-6 rounded transition-all"
                      style={{
                        background:
                          type === "empty"
                            ? "transparent"
                            : type === "vip"
                              ? "oklch(0.85 0.14 85)"
                              : type === "couple"
                                ? "oklch(0.7 0.18 350)"
                                : type === "aisle"
                                  ? "transparent"
                                  : "oklch(0.55 0.18 270)",
                        border:
                          type === "empty" || type === "aisle"
                            ? "1px dashed var(--border)"
                            : selected === key
                              ? "2px solid var(--foreground)"
                              : "none",
                      }}
                      aria-label={`${row}${col} ${type}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Property panel slide-in */}
        <aside
          className="w-64 shrink-0 rounded-xl border bg-background p-5 transition-all"
          style={{
            transform: selected ? "translateX(0)" : "translateX(20px)",
            opacity: selected ? 1 : 0.5,
          }}
        >
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Thuộc tính</div>
          {selected ? (
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Ô:</span>{" "}
                <span className="font-medium">{selected.replace("-", "")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Loại:</span>{" "}
                <span className="font-medium capitalize">{grid[selected]}</span>
              </div>
              <div className="pt-3">
                <span className="block text-xs text-muted-foreground">Đổi nhanh</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["normal", "vip", "couple", "empty"] as RoomCellType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setGrid((g) => ({ ...g, [selected]: t }))}
                      className="rounded border px-2 py-1 text-xs hover:bg-secondary"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Chọn một ô trên lưới để xem và chỉnh sửa thuộc tính.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
