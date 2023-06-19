import fs from 'fs'
import express from 'express'
//const express = require("express");
import https from 'https';
import multer from 'multer';
import { exec } from 'child_process';
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import bodyParser from "body-parser";
const app = express();

dotenv.config();

// Creating an instance of OpenAIApi with API key from the environment variables
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPEN_AI_API_KEY
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const upload = multer({
  dest: './public/img/vision'
});

// Set the view engine to EJS
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/', (req, res) => {
  res.render("index")
})

app.post('/ai', async (req, res) => {
  try {
    console.log(req.body.data, req.body.type)
    let result = await aiSend(req.body.data, req.body.type);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

app.post('/tell', (req, res) => {
  var data = req.body.data;
  while (data.includes(' ')) {
    data = data.replace(' ', '+');
  }

  exec(`curl -X POST -H 'Content-Type: application/json' -d '{\"json\": \"${data}\"}' http://localhost:3003/tell`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);

    res.json({
      message: stdout
    });
  });
});

app.get('/request', (req, res) => {
  const currentTime = Math.floor(Date.now() / 1000)
  const response = {
    time: currentTime + 5,
    text: "Hello"
  }
  console.log(response)
  res.json(response)
})

app.get('/dialog', (req, res) => {
  let result = dialogView("", 1)
  res.setHeader('Content-Type', 'application/json');
  res.json(result)
})

app.post('/upload', upload.single('image'), (req, res) => {
  const imageFile = req.file;
  if (!imageFile) {
    res.status(400).send('No image file found');
    return;
  }

  // rename the file to avoid collisions
  const fileName = Date.now() + '_' + imageFile.originalname;
  const imagePath = 'public/img/vision/' + fileName + '.jpeg';
  fs.renameSync(imageFile.path, imagePath);

  console.log('Image file saved');
  console.log(imagePath)

  exec(`curl -X POST -H 'Content-Type: application/json' -d '{\"file\": \"../../${imagePath}\"}' http://localhost:3004/vision`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);

    res.json({
      message: stdout
    });
  });
});

function dialogView(data, work, user) {
  if (work == "1") {
    var dialog = JSON.parse(fs.readFileSync('./public/db/dialog.json'))

    return dialog
  } else if (work == "2") {
    var dialog = JSON.parse(fs.readFileSync('./public/db/dialog.json'))
    var msg2dialog = {
      "sender": user,
      "content": data
    };
    
    dialog.messages.push(msg2dialog);
    fs.writeFileSync('./public/db/dialog.json', JSON.stringify(dialog))
  }
}

async function sendToServer(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function aiSend(data, type) {
  dialogView(data, 2, "user");
  if (type == "general") {
    var stdout = ''
    try {
      let command = `curl -X POST -H 'Content-Type: application/json' -d '{\"json\": \"${data}\"}' http://localhost:3008/classify`;
      let stdout = await sendToServer(command);
      console.log(stdout)
      if (stdout.includes('<dialog>')) {
        let command = `curl -X POST -H 'Content-Type: application/json' -d '{\"json\": \"${data}\"}' http://localhost:3001/yuna`;
        stdout = await sendToServer(command);
      } else {
        let command = `curl -X POST -H 'Content-Type: application/json' -d '{\"json\": \"${data}\"}' http://localhost:3007/generate`;
        stdout = await sendToServer(command);
      }
      console.log('return = ' + stdout)
      dialogView(stdout, 2, "bot");
      return stdout;
    } catch (error) {
      console.error(`exec error: ${error}`);
      throw error;
    }
  } else if (type == "yuna") {
    try {
      const command = `curl -X POST -H 'Content-Type: application/json' -d '{\"json\": \"${data}\"}' http://localhost:3001/yuna`;
      const stdout = await sendToServer(command);
      dialogView(stdout, 2, "bot");
      return stdout;
    } catch (error) {
      console.error(`exec error: ${error}`);
      throw error;
    }
  } else if (type == "search") {
    try {
      const command = `curl -X POST -H 'Content-Type: application/json' -d '{\"json\": \"${data}\"}' http://localhost:3003/search`;
      const stdout = await sendToServer(command);
      dialogView(stdout, 2, "bot");
      return stdout;
    } catch (error) {
      console.error(`exec error: ${error}`);
      throw error;
    }
  } else if (type == "gpt") {
    try {
      const chatGPTresult = await yunaGPT();
      dialogView(chatGPTresult.toString(), 2, "bot");
      return chatGPTresult;
    } catch (error) {
      console.error(`yunaGPT error: ${error}`);
      throw error;
    }
  }
}


async function yunaGPT() {
  let GPT35Turbo = async (message) => {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: message,
    });
  
    return response.data.choices[0].message.content;
  };
  
  const getChatResponse = async (chatHistory) => {
    const response = await GPT35Turbo(chatHistory);
    chatHistory.push({
      sender: "assistant",
      content: response
    });
  
    return chatHistory;
  };
  
  try {
    const json = JSON.parse(fs.readFileSync('./public/db/dialog.json'))
    const chatHistory = json.messages.filter(
      (message) => message.sender === "user" || message.sender === "other"
    ).map((message) => {
      const role = message.sender === "user" ? "user" : "assistant";
      return { role, content: message.content };
    });
    const finalResponse = await getChatResponse(chatHistory);
    global.chatGPT = finalResponse[finalResponse.length - 1].content
    return chatGPT
  } catch (error) {
    console.log(error);
  }
}

/*
const privateKey = fs.readFileSync('key.pem');
const certificate = fs.readFileSync('cert.pem');
const server = https.createServer({ key: privateKey, cert: certificate }, app);
*/

/*
server.listen(3000, () => {
  console.log(`Server running`);
});
*/

app.listen(3000, () => {
  console.log(`Server running`);
});