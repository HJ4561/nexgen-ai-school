import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  classes: [],
  subjects: [],
  rooms: [],
  teachers: [],
  loading: false,
  updating: false,
  error: null,
   timetable: [],
  timetableLoading: false,
  timetableUpdating: false,
  timetableError: null,
  inventory: [],
  inventorySummary: null,
  inventoryLoading: false,
  inventoryUpdating: false,
};

const academicsSlice = createSlice({
  name: "academics",
  initialState,
  reducers: {
    setAcademicsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAcademicsUpdating: (state, action) => {
      state.updating = action.payload;
    },
    setAcademicsError: (state, action) => {
      state.error = action.payload;
    },

    // ─── Classes ──────────────────────────────────────────────
    fetchClassesSuccess: (state, action) => {
      state.loading = false;
      state.classes = action.payload;
    },
    addClassSuccess: (state, action) => {
      state.classes.push(action.payload);
    },
    updateClassSuccess: (state, action) => {
      const index = state.classes.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) state.classes[index] = action.payload;
    },
    deleteClassSuccess: (state, action) => {
      state.classes = state.classes.filter((c) => c.id !== action.payload);
    },

    // ─── Subjects ──────────────────────────────────────────────
    fetchSubjectsSuccess: (state, action) => {
      state.loading = false;
      state.subjects = action.payload;
    },
    addSubjectSuccess: (state, action) => {
      state.subjects.push(action.payload);
    },
    updateSubjectSuccess: (state, action) => {
      const index = state.subjects.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) state.subjects[index] = action.payload;
    },
    deleteSubjectSuccess: (state, action) => {
      state.subjects = state.subjects.filter((s) => s.id !== action.payload);
    },

    // ─── Rooms ──────────────────────────────────────────────────
    fetchRoomsSuccess: (state, action) => {
      state.loading = false;
      state.rooms = action.payload;
    },
    addRoomSuccess: (state, action) => {
      state.rooms.push(action.payload);
    },
    updateRoomSuccess: (state, action) => {
      const index = state.rooms.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) state.rooms[index] = action.payload;
    },
    deleteRoomSuccess: (state, action) => {
      state.rooms = state.rooms.filter((r) => r.id !== action.payload);
    },

    // ─── Teachers (Dropdown) ───────────────────────────────────
    fetchTeachersForDropdownSuccess: (state, action) => {
      state.teachers = action.payload;
    },
   // ───  Timetable ──────────────────────────────────────────
    setTimetableLoading: (state, action) => {
      state.timetableLoading = action.payload;
    },
    setTimetableUpdating: (state, action) => {
      state.timetableUpdating = action.payload;
    },
    setTimetableError: (state, action) => {
      state.timetableError = action.payload;
    },
    fetchTimetableSuccess: (state, action) => {
      state.timetableLoading = false;
      state.timetable = action.payload;
    },
    addTimetableSuccess: (state, action) => {
      state.timetable.push(action.payload);
    },
    updateTimetableSuccess: (state, action) => {
      const index = state.timetable.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.timetable[index] = action.payload;
    },
    deleteTimetableSuccess: (state, action) => {
      state.timetable = state.timetable.filter((t) => t.id !== action.payload);
    },
    // Inventory
setInventoryLoading: (state, action) => {
  state.inventoryLoading = action.payload;
},
setInventoryUpdating: (state, action) => {
  state.inventoryUpdating = action.payload;
},
setInventoryError: (state, action) => {
  state.error = action.payload;
},
fetchInventorySuccess: (state, action) => {
  state.inventoryLoading = false;
  state.inventory = action.payload;
},
fetchInventorySummarySuccess: (state, action) => {
  state.inventorySummary = action.payload;
},
addInventorySuccess: (state, action) => {
  state.inventory.push(action.payload);
},
updateInventorySuccess: (state, action) => {
  const index = state.inventory.findIndex((i) => i.id === action.payload.id);
  if (index !== -1) state.inventory[index] = action.payload;
},
deleteInventorySuccess: (state, action) => {
  state.inventory = state.inventory.filter((i) => i.id !== action.payload);
},

  },
});


export const {
  setAcademicsLoading,
  setAcademicsUpdating,
  setAcademicsError,
  fetchClassesSuccess,
  addClassSuccess,
  updateClassSuccess,
  deleteClassSuccess,
  fetchSubjectsSuccess,
  addSubjectSuccess,
  updateSubjectSuccess,
  deleteSubjectSuccess,
  fetchRoomsSuccess,
  addRoomSuccess,
  updateRoomSuccess,
  deleteRoomSuccess,
  fetchTeachersForDropdownSuccess,
  setTimetableLoading,
  setTimetableUpdating,
  setTimetableError,
  fetchTimetableSuccess,
  addTimetableSuccess,
  updateTimetableSuccess,
  deleteTimetableSuccess,
  setInventoryLoading,
  setInventoryUpdating,
  setInventoryError,
  fetchInventorySuccess,
  fetchInventorySummarySuccess,
  addInventorySuccess,
  updateInventorySuccess,
  deleteInventorySuccess,
} = academicsSlice.actions;

export default academicsSlice.reducer;