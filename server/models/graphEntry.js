const mongoose = require("mongoose");

const GraphSchema = new mongoose.Schema({
    user:String,
    name:String, 
    nodes:Object,
    edges:Object
}); 
  
module.exports =  mongoose.model("GraphEntries", GraphSchema); 