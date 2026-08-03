import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

// ─── Inventory ─────────────────────────────────────────────────────────────

export const fetchInventory = createAsyncThunk(
  'academics/fetchInventory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/items/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

export const fetchInventorySummary = createAsyncThunk(
  'academics/fetchInventorySummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/summary/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory summary');
    }
  }
);

export const fetchInventoryStats = fetchInventorySummary;

export const createInventory = createAsyncThunk(
  'academics/createInventory',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/items/', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create inventory item');
    }
  }
);

export const updateInventory = createAsyncThunk(
  'academics/updateInventory',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/inventory/items/${id}/`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update inventory item');
    }
  }
);

export const deleteInventory = createAsyncThunk(
  'academics/deleteInventory',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/inventory/items/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete inventory item');
    }
  }
);

export const fetchInventoryItem = createAsyncThunk(
  'academics/fetchInventoryItem',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/items/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory item');
    }
  }
);

export const fetchLowStockItems = createAsyncThunk(
  'academics/fetchLowStockItems',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/low-stock/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock items');
    }
  }
);

// ─── Timetable ─────────────────────────────────────────────────────────────

export const fetchTimetable = createAsyncThunk(
  'academics/fetchTimetable',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/academics/timetable/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch timetable');
    }
  }
);

export const createTimetable = createAsyncThunk(
  'academics/createTimetable',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/academics/timetable/', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create timetable entry');
    }
  }
);

export const updateTimetable = createAsyncThunk(
  'academics/updateTimetable',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/academics/timetable/${id}/`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update timetable entry');
    }
  }
);

export const deleteTimetable = createAsyncThunk(
  'academics/deleteTimetable',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/academics/timetable/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete timetable entry');
    }
  }
);

// ─── Classes ─────────────────────────────────────────────────────────────

export const fetchClasses = createAsyncThunk(
  'academics/fetchClasses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/academics/classes/', { params });
      return response.data.results || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch classes');
    }
  }
);

export const createClass = createAsyncThunk(
  'academics/createClass',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/academics/classes/', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create class');
    }
  }
);

export const updateClass = createAsyncThunk(
  'academics/updateClass',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/academics/classes/${id}/`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update class');
    }
  }
);

export const deleteClass = createAsyncThunk(
  'academics/deleteClass',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/academics/classes/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete class');
    }
  }
);

// ─── Subjects ─────────────────────────────────────────────────────────────

export const fetchSubjects = createAsyncThunk(
  'academics/fetchSubjects',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/academics/subjects/', { params });
      return response.data.results || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subjects');
    }
  }
);

export const createSubject = createAsyncThunk(
  'academics/createSubject',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/academics/subjects/', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subject');
    }
  }
);

export const updateSubject = createAsyncThunk(
  'academics/updateSubject',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/academics/subjects/${id}/`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subject');
    }
  }
);

export const deleteSubject = createAsyncThunk(
  'academics/deleteSubject',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/academics/subjects/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subject');
    }
  }
);

// ─── Rooms ────────────────────────────────────────────────────────────────

export const fetchRooms = createAsyncThunk(
  'academics/fetchRooms',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/academics/rooms/', { params });
      return response.data.results || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rooms');
    }
  }
);

export const createRoom = createAsyncThunk(
  'academics/createRoom',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/academics/rooms/', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create room');
    }
  }
);

export const updateRoom = createAsyncThunk(
  'academics/updateRoom',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/academics/rooms/${id}/`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update room');
    }
  }
);

export const deleteRoom = createAsyncThunk(
  'academics/deleteRoom',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/academics/rooms/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete room');
    }
  }
);

// ─── Teachers (for dropdown) ─────────────────────────────────────────────

export const fetchTeachersForDropdown = createAsyncThunk(
  'academics/fetchTeachersForDropdown',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/teachers/');
      return response.data.results || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teachers');
    }
  }
);