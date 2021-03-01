'use strict'

const express = require('express');
require('dotenv').config();
const PORT = 3001;

const app = express();
app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}))

app.get('/hello',(req,res)=>{
    res.render('./pages/index.ejs');
})



app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));