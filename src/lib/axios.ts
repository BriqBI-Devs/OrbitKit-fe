import axios from "axios";

/**
 * Shared axios instance for the OrbitKit admin.
 * - baseURL points at the Express backend (NEXT_PUBLIC_API_URL).
 * - withCredentials lets the browser send/receive the `session_backend` cookie.
 *
 * Use this everywhere instead of importing `axios` directly so the auth cookie
 * and base URL are always applied.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export default api;
