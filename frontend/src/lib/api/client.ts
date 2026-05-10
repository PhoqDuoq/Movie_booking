import type {
  Cart,
  Movie,
  Order,
  Seat,
  SeatMap,
  Showtime,
  Theater,
} from "./types";

const API_BASE_URL = "http://localhost:3000/api";

// Temporarily hardcode COMBOS here since backend might not have this API yet.
export const COMBOS = [
  { id: "c1", name: "Combo 1 Big", desc: "1 Bắp lớn + 1 Nước ngọt", price: 69000, img: "/img/combo1.png" },
  { id: "c2", name: "Combo 2 Couple", desc: "1 Bắp lớn + 2 Nước ngọt", price: 89000, img: "/img/combo2.png" },
];

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  
  return JSON.parse(text);
}

/** GET /api/catalog/movies/now-showing */
export async function getNowShowing(): Promise<Movie[]> {
  return await fetchApi<Movie[]>('/catalog/movies/now-showing');
}

/** GET /api/catalog/movies/coming-soon */
export async function getComingSoon(): Promise<Movie[]> {
  return await fetchApi<Movie[]>('/catalog/movies/coming-soon');
}

export async function getMovie(movieCode: string): Promise<Movie | undefined> {
  return await fetchApi<Movie>(`/catalog/movies/${movieCode}`);
}

export async function getTheaters(): Promise<Theater[]> {
  return await fetchApi<Theater[]>('/catalog/theaters');
}

export async function getShowtimes(opts: {
  movieCode?: string;
  movieId?: string;
  theaterId?: string;
}): Promise<Showtime[]> {
  const params = new URLSearchParams();
  // Backend expects 'movieId' query param
  if (opts.movieId) params.append('movieId', opts.movieId);
  else if (opts.movieCode) params.append('movieId', opts.movieCode); // in case backend supports movie_code lookup
  
  let data = await fetchApi<Showtime[]>(`/catalog/showtimes?${params.toString()}`);
  
  if (opts.theaterId) {
    data = data.filter(s => s.theater_id === opts.theaterId);
  }
  return data;
}

export async function getShowtime(id: string): Promise<Showtime | undefined> {
  return await fetchApi<Showtime>(`/catalog/showtimes/${id}`);
}

/** GET /api/catalog/showtimes/{id}/seats */
export async function getSeatMap(showtimeId: string): Promise<SeatMap> {
  return await fetchApi<SeatMap>(`/catalog/showtimes/${showtimeId}/seats`);
}

/** POST /api/bookings/lock-seat */
export async function lockSeat(payload: {
  showtime_id: string;
  seat_id: string;
  user_id: string;
}): Promise<{ ok: true; ttl: number }> {
  return await fetchApi<{ ok: true; ttl: number }>('/bookings/lock-seat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** DELETE /api/bookings/unlock-seat */
export async function unlockSeat(payload: {
  showtime_id: string;
  seat_id: string;
  user_id: string;
}): Promise<{ ok: true }> {
  return await fetchApi<{ ok: true }>('/bookings/unlock-seat', {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
}

/** POST /api/payments/checkout */
export async function checkout(cart: Cart): Promise<{ order_id: string; payUrl: string }> {
  return await fetchApi<{ order_id: string; payUrl: string }>('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify(cart),
  });
}

/** GET /api/bookings/tickets/{order_id} */
export async function getTicket(orderId: string): Promise<Order | undefined> {
  return await fetchApi<Order>(`/bookings/tickets/${orderId}`);
}

export async function confirmPayment(orderId: string): Promise<Order> {
  return await fetchApi<Order>(`/payments/confirm/${orderId}`, { method: 'POST' });
}
