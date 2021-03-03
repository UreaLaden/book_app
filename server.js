'use strict'

//#region Server Requirements
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();

const PORT = process.env.PORT || 3001
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log(error));

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
//#endregion


app.get('/', getCurrentBooks);
app.get('/books/:id',getSpecificBook);
app.get('/pages/books/show', showBooks);
app.get('/pages/searches/new', queryNewBooks);
app.post('/search', findBooks);



//#region Route Functions

function findBooks(req,res){
  const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.selectionType}:${req.body.query}`;
  superagent.get(url)
    .then(data => {

      const newBookList = getBookList(data.body.items);
      console.log(url);
      // res.redirect('/show');
      console.log(data.body.items);
      const ejsObject = { books: newBookList};
      res.render('./pages/books/show.ejs', ejsObject);
    })
    .catch(error =>
      res.render('./pages/searches/error.ejs', error));
}

function showBooks(req,res){
  const ejsObject = { books: books };
  res.render('./pages/books/show.ejs', ejsObject);}

function queryNewBooks(req,res){
  res.render('./pages/searches/new.ejs');}

function getCurrentBooks(req, res) {
  const sqlString = 'SELECT * FROM books ;';
  const sqlArray = [];
  client.query(sqlString, sqlArray)
  .then(result => {
    console.log(result);
    const ejsObject = {currentBooks: result.rows, totalBooks: result.rowCount};
    res.render('./pages/index.ejs', ejsObject);
  });}

function getSpecificBook(req,res){
  console.log('params id',req.params.id);
  const sqlString = 'SELECT * FROM books WHERE id=$1;';
  const sqlArr = [req.params.id];
  client.query(sqlString,sqlArr)
  .then((result)=>{
    console.log(result.rows[0]);
    const ejsObject = {specificBook:result.rows[0]};
    res.render('./pages/books/detail.ejs',ejsObject);
  })
}
//#endregion

//#region Constructor Functions
function getBookList(bookInfo) {
  return bookInfo.map(book => {
    return new Book(
      book.volumeInfo.title,
      book.volumeInfo.authors,
      book.volumeInfo.description,
      book.volumeInfo.imageLinks)
  }
  );
}

function Book(title, authors, description, image) {
  let dummyImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = title,
  this.image = image = image !== undefined ? image.thumbnail : dummyImage,
  this.authors = authors,
  this.description = description
}

//#endregion
client.connect().then(() => {
  app.listen(PORT, () => {console.log(`Listening on http://localhost:${PORT}`);});

});
