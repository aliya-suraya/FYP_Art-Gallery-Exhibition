const mongoose = require("mongoose");

const gltfSchema = new mongoose.Schema({
  data: {
    type: String,
    required: true,
  },
  descriptions: [
  {
    frameName: String,
    description: String,
},
],
});

const GlTFModel = mongoose.model("GLTF", gltfSchema);

module.exports = GlTFModel;
