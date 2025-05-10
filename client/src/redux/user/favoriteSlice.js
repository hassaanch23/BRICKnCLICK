import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async actions for interacting with the backend API
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.currentUser.token;
      const response = await axios.get("/api/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Return the favorites from the backend
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addFavoriteAsync = createAsyncThunk(
  "favorites/addFavorite",
  async (listingId, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.currentUser.token;
      const response = await axios.post(
        `/api/favorites/${listingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return listingId; // Return the listing ID to add to the Redux state
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeFavoriteAsync = createAsyncThunk(
  "favorites/removeFavorite",
  async (listingId, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.currentUser.token;
      const response = await axios.delete(`/api/favorites/${listingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return listingId; // Return the listing ID to remove from the Redux state
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const favoriteSlice = createSlice({
  name: "favorites",
  initialState: {
    items: [], // list of favorite listing IDs
    loading: false,
    error: null,
  },
  reducers: {
    setFavorites: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFavoriteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFavoriteAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addFavoriteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFavoriteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFavoriteAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((id) => id !== action.payload);
      })
      .addCase(removeFavoriteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
