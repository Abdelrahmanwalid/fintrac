// src/store/itemSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchItems,
  addItem,
  updateItem,
  deleteItem,
  updateItemOrder,
} from "../Api/itemApi";

export const fetchItemsAsync = createAsyncThunk(
  "items/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchItems();
      console.log("Fetched Items:", response);
      return response;
    } catch (error) {
      console.error("Error fetching items:", error);
      return rejectWithValue(error.message);
    }
  }
);
export const addItemAsync = createAsyncThunk(
  "items/addItem",
  async ({ categoryId, itemName }, { rejectWithValue }) => {
    try {
      return await addItem(categoryId, itemName);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateItemAsync = createAsyncThunk(
  "items/updateItem",
  async ({ itemId, itemData }, { rejectWithValue }) => {
    try {
      const updatedItem = await updateItem(itemId, itemData); // Call API
      return { itemId, updatedItem }; // Return updated item
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteItemAsync = createAsyncThunk(
  "items/deleteItem",
  async (itemId, { rejectWithValue }) => {
    try {
      await deleteItem(itemId);
      return itemId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateItemOrderAsync = createAsyncThunk(
  "items/updateItemOrder",
  async (
    { itemId, newOrder, sourceCategoryId, targetCategoryId },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await updateItemOrder(
        itemId,
        newOrder,
        sourceCategoryId,
        targetCategoryId
      );
      // After successful update, re-fetch items to ensure we have correct ordering from server
      dispatch(fetchItemsAsync());
      return { itemId, newOrder, sourceCategoryId, targetCategoryId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const itemSlice = createSlice({
  name: "items",
  initialState: {
    itemsByCategory: {},
    selectedItem: null,
    loading: false,
    error: null,
  },
  reducers: {
    selectItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItemsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItemsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.itemsByCategory = {};
        action.payload.forEach((item) => {
          if (!state.itemsByCategory[item.categoryId]) {
            state.itemsByCategory[item.categoryId] = [];
          }
          state.itemsByCategory[item.categoryId].push({
            ...item,
            id: item._id,
          }); // Normalize _id to id if needed
        });
        if (state.selectedItem) {
          const updatedItem = Object.values(state.itemsByCategory)
            .flat()
            .find((i) => i._id === state.selectedItem._id);
          if (updatedItem) state.selectedItem = updatedItem;
        }
      })
      .addCase(fetchItemsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateItemAsync.fulfilled, (state, action) => {
        const { itemId, updatedItem } = action.payload;
        const categoryItems =
          state.itemsByCategory[updatedItem.categoryId] || [];
        const itemIndex = categoryItems.findIndex(
          (item) => item._id === itemId
        );
        if (itemIndex !== -1) {
          categoryItems[itemIndex] = updatedItem;
        }
        if (state.selectedItem && state.selectedItem._id === itemId) {
          state.selectedItem = updatedItem;
        }
      });
  },
});
export const selectItemsByCategory = (state, categoryId) => {
  return (state.items.itemsByCategory[categoryId] || [])
    .slice() // Create a shallow copy so the original state isn't mutated
    .sort((a, b) => a.order - b.order);
};

export const { selectItem, clearSelectedItem } = itemSlice.actions;
export default itemSlice.reducer;
