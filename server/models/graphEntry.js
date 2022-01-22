const mongoose = require("mongoose");

const GraphSchema = new mongoose.Schema({
  user: String,
  name: String,
  nodes: Object,
  edges: Object,
  directed: Boolean,
  weighted: Boolean,
});

module.exports = mongoose.model("GraphEntries", GraphSchema);
