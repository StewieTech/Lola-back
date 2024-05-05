require('dotenv').config();
const OpenAI = require('openai');
const {Configuration, OpenAIApi} = OpenAI;


const secrets = require('./secrets');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const multer = require('multer');

const axios = require('axios');

const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3001;

const upload = multer({ dest: 'uploads/' });


app.use(bodyParser.json());
app.use(cors());



// app.use(express.static('client/public'));

//
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.get('/google-auth', (req, res) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  res.json({clientId, clientSecret});
});

app.post('/googlelogin', async (req, res) => {
  const {tokenId} = req.body;
  client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  }).then(response => {
    const {email_verified, name, email} = response.payload;
    if (email_verified) {
      res.json({
        message: 'Login success!',
        user: {name, email},
      });
    } else {
      res.json({
                message: 'Login failed!',
              });
            }
          });
        });
        

app.post('/', async (req, res) => {
  
  const {message} = req.body ;
  const contentAnswer = secrets.contentAnswer ;
  
  
  const response = await openai.createChatCompletion({
    "model": "gpt-3.5-turbo",
    messages: [
      {role: "system", content: contentAnswer},
      {role: "user", content: message},
    ],
    
    
    "max_tokens": 40,
    "temperature": 0
  });
  
  console.log(response.data)

 var answer = response["data"]["choices"][0]["message"]["content"]
 console.log(answer);
 if(answer) {
       res.json({
           message: answer
       });
   }
});



app.get('/', (req, res) => {
  console.log('Root route accessed');
    res.send('Hey Yall World')
});

          
app.use(express.static(path.join(__dirname, 'client', 'public')));
          
// Route for uploading and processing images
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image uploaded.');
  }
  
  const filePath = req.file.path;
  const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
  
  // Immediately delete the file after reading
  fs.unlinkSync(filePath);
  
  const headers = {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
  };
  
    const payload = {
        "model": "gpt-4-vision-preview", // Placeholder, adjust as needed
        "inputs": `data:image/jpeg;base64,${imageBase64}`,
        "max_tokens": 100 ,
        "detail": "low"
    };

    try {
        // Assuming the vision API expects a POST request with the image in base64 HEREEE
        const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers: headers });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing the image with GPT-4 Vision API");
    }
});








const listImagesFromDirectory = (subDirectory) => {
    return new Promise((resolve, reject) => {
      const directoryPath = path.join(__dirname, 'client', 'public', subDirectory);
      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          console.log(`Error reading directory: ${directoryPath}`, err);
          reject("Failed to list images");
        } else {
          console.log(`Files found in ${directoryPath}:`, files);
          const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(file))
                                  .map(file => `/` + path.join(subDirectory, file));
          resolve(imageFiles);
        }
      });
    });
  };

// Endpoint for listing images in headerMain
app.get('/api/images/headerMain', async (req, res) => {
    try {
      const images = await listImagesFromDirectory('headerMain');
      res.json(images); // Removing 'public' from the path, as static serve does this automatically
    } catch (error) {
      console.error(`Error in /api/images/headerMain:`, error);
      res.status(500).send(error);
    }
  });

// Endpoint for listing images in Yoga
app.get('/api/images/Yoga', async (req, res) => {
    try {
      const images = await listImagesFromDirectory('Yoga');
      res.json(images); // Removing 'public' from the path, as static serve does this automatically
    } catch (error) {
      console.error(`Error in /api/images/Yoga:`, error);
      res.status(500).send(error);
    }
  });
  


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

                           