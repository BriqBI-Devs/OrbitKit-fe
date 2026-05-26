import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { getMyDetails, login, logout } from "../thunks/auth.thunks";

export type User = {
  _id?: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
};

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      if (action.payload.role === "admin") {
        state.isAuthenticated = true;
        toast.success("Welcome back, Admin!");
      } else {
        state.isAuthenticated = false;
        toast.error("Only admins can access this panel.");
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "Login failed";
      toast.error(state.error);
    });

    // getMyDetails (GET /auth/me)
    builder.addCase(getMyDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMyDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.user = action.payload?.data ?? null;
      state.isAuthenticated = !!state.user;
    });
    builder.addCase(getMyDetails.rejected, (state, action) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload ?? "Could not load profile";
    });

    // logout
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(logout.fulfilled, (state, action) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      toast.success(action.payload?.message ?? "Logged out");
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "Logout failed";
      toast.error(state.error);
    });
  },
});

export default authSlice.reducer;
