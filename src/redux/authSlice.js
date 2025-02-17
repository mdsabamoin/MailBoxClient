import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_KEY = `AIzaSyBeLNbM4bJkbfH3niYIFGb7A8YqRJ3ew5c`;

// Thunks for Signup and Login
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
        { email, password, returnSecureToken: true }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || "Signup failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        { email, password, returnSecureToken: true }
      );
      
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || "Login failed");
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    enter:null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.enter=null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup User
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.enter = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.enter=null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.enter = null;
      })
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.enter = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.enter = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.enter = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
