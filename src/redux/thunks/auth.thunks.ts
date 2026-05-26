import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  role: string;
};

// POST /auth/login -> sets cookie, returns { message, role }.
// On success we immediately load the full user via getMyDetails.
export const login = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, thunkApi) => {
  try {
    const response = await api.post("/auth/login", {
      email: payload.email,
      password: payload.password,
    });

    await thunkApi.dispatch(getMyDetails());

    return response.data as LoginResponse;
  } catch (error: any) {
    return thunkApi.rejectWithValue(
      error?.response?.data?.message || error.message || "Something went wrong"
    );
  }
});

// GET /auth/me -> { data: user } (requires cookie)
export const getMyDetails = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("auth/me", async (_, thunkApi) => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error: any) {
    return thunkApi.rejectWithValue(
      error?.response?.data?.message || error.message || "Something went wrong"
    );
  }
});

// DELETE /auth/logout
export const logout = createAsyncThunk<any, void, { rejectValue: string }>(
  "auth/logout",
  async (_, thunkApi) => {
    try {
      const response = await api.delete("/auth/logout");
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    }
  }
);
