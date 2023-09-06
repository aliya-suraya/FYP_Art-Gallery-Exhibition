const express = require ("express");
const mongoose = require ("mongoose");
const dotenv = require ("dotenv");
const bodyParser = require ("body-parser");
const app = express();
const multer = require ("multer");

dotenv.config();

//connect to mongodb
mongoose.connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

.then(() => {
console.log("Connected to MongoDB");
// server
app.listen(3000, () => {
    console.log("backend running");
});
})
.catch((error) => {
    console.error("Error connecting to MongoDB", error);
}); 


app.use(bodyParser.urlencoded ({ extended: true}));
app.use(bodyParser.json({ limit: '50mb'}));
app.use("/", express.static("public"));

const storage = multer.memoryStorage();
const Model = require ('./model/model.js')
const User = require ('./model/user.js')
const GlTFModel = require("./model");

const connectedClients = [];

app.use(express.json());

      function notifyClients(data) {
        const eventData = `data: ${JSON.stringify(data)}\n\n`;
      
        connectedClients.forEach((client) => {
          client.write(eventData);
        });
      }
      
app.post('/upload_gltf', async (req, res) => {
    const gltfData = req.body.gltfData;
    const descriptions = req.body.descriptions;

    console.log('Received GLTF data:', gltfData);
    console.log('Received Descriptions:', descriptions);

    try {
      const newGltf = new GlTFModel({ data: gltfData, descriptions: descriptions });
      const savedGltf = await newGltf.save();
  
      // Get the saved glTF model's ID using the insertedId property
      const savedModelId = savedGltf._id;
  
      const newModelData = { id: savedModelId };
      notifyClients(newModelData);
  
      console.log('GLTF file saved successfully');
      res.json({ success: true });
    } catch (err) {
      console.error('Error saving GLTF file:', err);
      res.status(500).json({ error: 'Error saving GLTF file' });
    }
  });

  app.get('/get_latest_gltf', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  
    // Store the response object in the array of connected clients
    connectedClients.push(res);
  
    // Remove the response object from the array when the client connection is closed
    req.on('close', () => {
      const index = connectedClients.indexOf(res);
      if (index !== -1) {
        connectedClients.splice(index, 1);
      }
    });


// Fetch the latest glTF data from the database using your preferred method
try {
    const latestGltf = await GlTFModel.findOne().sort({ _id: -1 }).limit(1);
    if (!latestGltf) {
      return res.status(404).json({ error: 'glTF data not found' });
    }

    // Send the glTF data to the client
    res.write(`data: ${JSON.stringify({ gltfData: latestGltf.data, descriptions: latestGltf.descriptions })}\n\n`);
  } catch (err) {
    console.error('Error fetching glTF data:', err);
    res.status(500).json({ error: 'Error fetching glTF data' });
  }
});

app.get('/get_description', async (req, res) => {
    const frameName = req.query.frame; // Retrieve the frame name from the query parameter
  
    try {
      const glTFData = await GlTFModel.findOne({ "descriptions.frameName": frameName });
      if (!glTFData) {
        return res.status(404).json({ error: 'Description not found' });
      }
  
      // Find the description for the specified frame name
      const description = glTFData.descriptions.find(desc => desc.frameName === frameName).description;
      res.json({ description });
    } catch (error) {
      console.error('Error fetching description:', error);
      res.status(500).json({ error: 'Error fetching description' });
    }
  });

//route handler 
const registerRouter= require('./router/register.js')
const loginRouter = require('./router/login.js')
const modelRouter = require('./router/model.js')


app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/model', modelRouter);


//root route handler
app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html");
});
