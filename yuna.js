const fs = require("fs")
const express = require("express")
const exec = require("child_process")
const bodyParser = require("child_process")
const app = express();

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
  }
}

app.listen(3000, () => {
  console.log(`Server running`);
});