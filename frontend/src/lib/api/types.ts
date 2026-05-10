// API contract types — match backend microservices spec using snake_case.

export type Movie = {
  id: string; // UUID
  movie_code: string; // e.g. MOV-0001
  title: string;
  tagline: string;
  genre: string; // comma-separated string from DB
  rating: number; // 0-10
  age_rating: string; // T18, P, K
  duration_mins: number; // minutes
  language: string;
  poster_url: string;
  backdrop_url: string;
  trailer_color: string; // accent color (hex / oklch) for hero gradient
  status: "NOW_SHOWING" | "COMING_SOON";
  release_date: string;
  description: string;
  director: string;
  cast_members: string; // comma-separated string from DB
};

export type Theater = {
  id: string; // CPLX-0001 (mapped from complex_id or id in theater_complexes)
  name: string;
  city: string;
  address: string;
};

export type Showtime = {
  id: string; // UUID
  movie_id: string; // DB uses movie_id, we can map to movie_code or just use this
  theater_id: string; // mapped from complex_id
  room_id: string;
  start_time: string; // ISO
  end_time: string; // ISO
  base_price: number; // VND base
  // format might need to be resolved by joining room table in backend, but we'll include it here
  format?: "2D" | "3D" | "IMAX" | "4DX";
};

export type SeatType = "NORMAL" | "VIP" | "AISLE" | "COUPLE";
export type SeatStatus = "AVAILABLE" | "SOLD" | "LOCKED";

export type Seat = {
  id: string; // ST-0001
  room_id: string;
  row_name: string;
  seat_number: number;
  seat_type: SeatType;
  status?: SeatStatus; // dynamic based on bookings/redis
  price?: number; // dynamic based on showtime base_price and seat_type
};

export type SeatMap = {
  showtime_id: string;
  rows: string[];
  cols: number;
  seats: Seat[];
};

export type ConcessionItem = {
  id: string;
  name: string;
  price: number;
};

export type Cart = {
  showtime_id: string;
  seat_ids: string[];
  combos: { id: string; qty: number }[];
};

export type Order = {
  id: string; // UUID
  booking_id?: string;
  ticket_code: string;
  showtime_id: string;
  movie_code: string;
  seat_ids: string[];
  total_amount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED" | "SUCCESS" | "FAILED" | "paid" | "failed";
  created_at: string;
};

export type RoomCellType = "normal" | "vip" | "couple" | "aisle" | "empty";
export type RoomLayoutCell = {
  row: string;
  col: number;
  type: RoomCellType;
  status: "active" | "disabled";
};
