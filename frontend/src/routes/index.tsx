import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getComingSoon, getNowShowing, getTheaters } from "@/lib/api/client";
import type { Movie, Theater } from "@/lib/api/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumière — Đặt vé xem phim" },
      {
        name: "description",
        content:
          "Khám phá phim đang chiếu và sắp chiếu tại hệ thống rạp Lumière. Đặt vé trực tuyến trong vài phút.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: now = [] } = useQuery({ queryKey: ["movies", "now"], queryFn: getNowShowing });
  const { data: soon = [] } = useQuery({ queryKey: ["movies", "soon"], queryFn: getComingSoon });
  const { data: theaters = [] } = useQuery({ queryKey: ["theaters"], queryFn: getTheaters });

  return (
    <div className="relative">
      <Hero movies={now} />
      <Filters theaters={theaters} />
      <Section id="now-showing" title="Đang chiếu" subtitle="Phim hot nhất tuần này" movies={now} />
      <Section id="coming-soon" title="Sắp chiếu" subtitle="Đặt lịch nhắc trước ngày khởi chiếu" movies={soon} />
      <footer className="border-t border-border/40 py-12 text-center text-sm text-muted-foreground">
        © 2026 Lumière Cinema · Lý Thường Kiệt, Hà Nội
      </footer>
    </div>
  );
}

function Hero({ movies }: { movies: Movie[] }) {
  const [idx, setIdx] = useState(0);
  const featured = movies[idx];

  useEffect(() => {
    if (!movies.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % movies.length), 7000);
    return () => clearInterval(t);
  }, [movies.length]);

  if (!featured) return <div className="h-[80vh]" />;

  return (
    <section
      className="relative -mt-20 h-[92vh] w-full overflow-hidden"
      style={{
        // gradient pulse colored by feature movie
        ["--feat" as string]: featured.trailer_color,
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        <img
          key={featured.movie_code}
          src={featured.backdrop_url}
          alt=""
          className="h-full w-full object-cover animate-fade-in"
          style={{ animationDuration: "1.2s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div
          className="absolute inset-0 animate-glow-pulse"
          style={{
            background:
              "radial-gradient(60% 50% at 70% 40%, color-mix(in oklab, var(--feat) 40%, transparent), transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex h-full max-w-7xl items-end px-6 pb-28">
        <div key={featured.movie_code} className="max-w-2xl animate-slide-up">
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span>Tiêu điểm</span>
            <span className="h-px w-12 bg-foreground/30" />
            <span>{featured.genre}</span>
          </div>
          <h1 className="text-balance text-6xl font-semibold leading-[1.05] md:text-7xl">
            {featured.title}
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">{featured.tagline}</p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              to="/movies/$movieCode"
              params={{ movieCode: featured.movie_code }}
              className="rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
            >
              Đặt vé ngay
            </Link>
            <span className="text-sm text-muted-foreground">
              {featured.duration_mins} phút · {featured.age_rating} · ⭐ {featured.rating}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar carousel indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 flex w-[min(680px,80vw)] -translate-x-1/2 gap-2">
        {movies.map((m, i) => (
          <button
            key={m.movie_code}
            onClick={() => setIdx(i)}
            className="group relative h-[3px] flex-1 overflow-hidden rounded-full bg-foreground/15"
            aria-label={m.title}
          >
            <span
              className="absolute inset-y-0 left-0 bg-foreground/80"
              style={{
                width: i < idx ? "100%" : i === idx ? "0%" : "0%",
                animation: i === idx ? "progress-fill 7s linear forwards" : undefined,
              }}
            />
          </button>
        ))}
      </div>

      <style>{`@keyframes progress-fill { from { width: 0% } to { width: 100% } }`}</style>
    </section>
  );
}

function Filters({ theaters }: { theaters: { id: string; name: string; city: string }[] }) {
  return (
    <div className="mx-auto -mt-20 max-w-5xl px-6">
      <div className="glass-panel grid gap-4 rounded-2xl p-6 md:grid-cols-3">
        <UnderlineInput label="Tìm phim" placeholder="Nhập tên phim…" />
        <UnderlineSelect label="Khu vực" options={theaters.map((t) => `${t.city} — ${t.name}`)} />
        <UnderlineInput label="Ngày" type="date" />
      </div>
    </div>
  );
}

function UnderlineInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="group block">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="relative mt-2">
        <input
          {...rest}
          className="w-full bg-transparent pb-2 text-base outline-none placeholder:text-muted-foreground/60"
        />
        <span className="absolute bottom-0 left-0 h-px w-full bg-border" />
        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-focus-within:w-full" />
      </div>
    </label>
  );
}

function UnderlineSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="group block">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="relative mt-2">
        <select className="w-full appearance-none bg-transparent pb-2 text-base outline-none">
          <option value="">Tất cả</option>
          {options.map((o) => (
            <option key={o} className="bg-background">
              {o}
            </option>
          ))}
        </select>
        <span className="absolute bottom-0 left-0 h-px w-full bg-border" />
        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-focus-within:w-full" />
      </div>
    </label>
  );
}

function Section({
  id,
  title,
  subtitle,
  movies,
}: {
  id: string;
  title: string;
  subtitle: string;
  movies: Movie[];
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {movies.map((m) => (
          <MovieCard key={m.movie_code} movie={m} />
        ))}
      </div>
    </section>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link
      to="/movies/$movieCode"
      params={{ movieCode: movie.movie_code }}
      className="group relative block overflow-hidden rounded-xl bg-card transition-all duration-500 hover:z-10 hover:scale-[1.04]"
      style={{ aspectRatio: "2/3" }}
    >
      <img
        src={movie.poster_url}
        alt={movie.title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `0 30px 60px -10px ${movie.trailer_color}` }}
      />
      <div className="absolute inset-x-0 bottom-0 translate-y-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          {movie.genre?.split(",")[0] || ""} · ⭐ {movie.rating}
        </div>
        <div className="mt-1 text-lg font-semibold">{movie.title}</div>
      </div>
      <div className="absolute left-3 top-3 rounded-md border border-white/20 bg-black/40 px-2 py-1 text-[10px] font-medium tracking-widest backdrop-blur">
        {movie.age_rating}
      </div>
    </Link>
  );
}
