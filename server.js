'use strict'

const express = require('express');
<<<<<<< HEAD
const PORT = 3001;
const superagent = require('superagent');
const app = express();

require('dotenv').config();
=======
const app = express();
require('dotenv').config();
const superagent = require('superagent');

const PORT = 3001;
>>>>>>> 2171ce4b38fdf123c8eb1a2c01547e459135d7b5

app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');


app.get('/hello',(req,res) =>{
  res.render('./pages/index.ejs');
})


app.get('/bookData', (req, res)=>{
  const url = `https://www.googleapis.com/books/v1/volumes?q=in${selection}:${req.query}`;

  superagent.get(url)
  .then(data => 
    {
      res.send(data.body)
    });
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));