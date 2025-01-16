// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import mailReducer from "./mailSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    mail:mailReducer // Add the authentication slice here
  },
});

export default store;
