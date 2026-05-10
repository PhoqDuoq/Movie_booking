import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMovie, getShowtimes, getTheaters } from "@/lib/api/client";
import { useState } from "react";

export const Route = createFileRoute("/movies/$movieCode")({
  loader: async ({ params }) => {
    const movie = await getMovie(params.movieCode);
    if (!movie) throw notFound();
    return movie;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Phim"} — Lumière` },
      { name: "description", content: loaderData?.description ?? "Chi tiết phim tại Lumière" },
      { property: "og:title", content: loaderData?.title ?? "Lumière" },
      { property: "og:description", content: loaderData?.tagline ?? "" },
      { property: "og:image", content: loaderData?.backdrop_url ?? "" },
    ],
  }),
  component: MoviePage,
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p>Không tìm thấy phim.</p>
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-10">{error.message}</div>,
});

function MoviePage() {
  const movie = Route.useLoaderData();
  const [theaterId, setTheaterId] = useState<string>("");
  const { data: theaters = [] } = useQuery({ queryKey: ["theaters"], queryFn: getTheaters });
  const { data: showtimes = [] } = useQuery({
    queryKey: ["showtimes", movie.movie_code, theaterId],
    queryFn: () => getShowtimes({ movieCode: movie.movie_code, theaterId: theaterId || undefined }),
  });

  return (
    <div className="relative">
      <div className="relative -mt-20 h-[70vh] overflow-hidden">
        <img src={movie.backdrop_url} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      </div>

      <div className="mx-auto -mt-48 max-w-7xl px-6 pb-24">
        <div className="grid gap-10 md:grid-cols-[280px_1fr]">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="aspect-[2/3] w-full rounded-xl object-cover shadow-[var(--shadow-elegant)]"
          />
          <div className="animate-slide-up">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {movie.genre}
            </div>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight md:text-6xl">{movie.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{movie.tagline}</p>

            <dl className="mt-8 grid grid-cols-2 gap-x-10 gap-y-4 text-sm md:grid-cols-4">
              <Meta label="Thời lượng" value={`${movie.duration_mins} phút`} />
              <Meta label="Phân loại" value={movie.age_rating} />
              <Meta label="Đánh giá" value={`⭐ ${movie.rating}`} />
              <Meta label="Khởi chiếu" value={new Date(movie.release_date).toLocaleDateString("vi-VN")} />
              <Meta label="Đạo diễn" value={movie.director} />
              <Meta label="Diễn viên" value={movie.cast_members} />
              <Meta label="Ngôn ngữ" value={movie.language} />
            </dl>

            <p className="mt-8 max-w-3xl text-base leading-relaxed text-foreground/90">
              {movie.description}
            </p>
          </div>
        </div>

        {/* Showtimes */}
        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-3xl font-semibold tracking-tight">Lịch chiếu</h2>
            <select
              value={theaterId}
              onChange={(e) => setTheaterId(e.target.value)}
              className="glass-panel rounded-full px-4 py-2 text-sm outline-none"
            >
              <option value="" className="bg-background">
                Tất cả rạp
              </option>
              {theaters.map((t) => (
                <option key={t.id} value={t.id} className="bg-background">
                  {t.city} — {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3">
            {Object.entries(groupBy(showtimes, (s) => s.theater_id)).map(([tid, list]) => {
              const t = theaters.find((x) => x.id === tid);
              return (
                <div key={tid} className="glass-panel rounded-2xl p-5">
                  <div className="mb-4 flex items-baseline justify-between">
                    <div>
                      <div className="text-lg font-medium">{t?.name ?? tid}</div>
                      <div className="text-xs text-muted-foreground">
                        {t?.city} · {t?.address}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {list.map((s) => (
                      <Link
                        key={s.id}
                        to="/booking/$showtimeId"
                        params={{ showtimeId: s.id }}
                        className="group rounded-lg border border-border bg-secondary/40 px-4 py-2 text-sm transition-all hover:border-primary hover:bg-primary/10"
                      >
                        <span className="font-medium">
                          {new Date(s.start_time).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground group-hover:text-foreground">
                          {s.format}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}

function groupBy<T, K extends string>(arr: T[], fn: (x: T) => K): Record<K, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = fn(item);
      (acc[key] ||= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}
