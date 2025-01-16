import { createSlice } from "@reduxjs/toolkit";

const mailSlice = createSlice({
  name: "mail",
  initialState: {
    mails: [],
    unreadCount: 0,
  },
  reducers: {
    setMails(state, action) {
      state.mails = action.payload;
      state.unreadCount = action.payload.filter((mail) => !mail.read).length;
    },
    markAsRead(state, action) {
      const mailId = action.payload;
      const mail = state.mails.find((m) => m.id === mailId);
      if (mail && !mail.read) {
        mail.read = true;
        state.unreadCount -= 1;
      }
    },
  },
});

export const { setMails, markAsRead } = mailSlice.actions;
export default mailSlice.reducer;
