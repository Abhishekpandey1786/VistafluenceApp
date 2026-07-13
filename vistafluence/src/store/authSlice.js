import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { loginAPI, registerAPI, getMeAPI } from '../api';

// ── Auth Slice ───────────────────────────────────────────────────
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await loginAPI(credentials);
    await SecureStore.setItemAsync('token', data.token);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await registerAPI(userData);
    await SecureStore.setItemAsync('token', data.token);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await getMeAPI();
    return data.user;
  } catch (err) {
    return rejectWithValue('Session expired');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null, initialized: false },
  reducers: {
    logout: (state) => {
      state.user = null;
      SecureStore.deleteItemAsync('token');
    },
    clearError: (state) => { state.error = null; },
    updateUser: (state, action) => { state.user = { ...state.user, ...action.payload }; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const fulfilled = (state, action) => { state.loading = false; state.user = action.payload; state.initialized = true; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; state.initialized = true; };
    builder
      .addCase(loginUser.pending, pending).addCase(loginUser.fulfilled, fulfilled).addCase(loginUser.rejected, rejected)
      .addCase(registerUser.pending, pending).addCase(registerUser.fulfilled, fulfilled).addCase(registerUser.rejected, rejected)
      .addCase(fetchMe.pending, (state) => { state.loading = true; })
      .addCase(fetchMe.fulfilled, fulfilled)
      .addCase(fetchMe.rejected, (state) => { state.loading = false; state.initialized = true; });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;

// ── Store ────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});