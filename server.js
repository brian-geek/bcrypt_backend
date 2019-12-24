const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const cool = require('cool-ascii-faces');
const bodyParser = require('body-parser');
const errorHandler = require('./error-handler');
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


//app.get('/', (req, res)=> res.send('Hi, my client!!!!'));
//app.get('/cool', (req, res)=>res.send(cool()));
app.use('/', require('./user-controller'));

app.use(errorHandler);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})