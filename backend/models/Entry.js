import mongoose from "mongoose";

const EntrySchema = new mongoose.Schema({
  user: { type: String, required: true },
  date: { type: String, required: true },
  questionssolved: { type: Number, required: true },
  problemLinks: [String],
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model("Entry", EntrySchema);
