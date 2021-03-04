'use strict'

//#region Server Requirements
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();
const methodOverride = require('method-override');

const PORT = process.env.PORT || 3001
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log(error));

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
//#endregion


app.get('/', getCurrentBooks);
app.get('/books/:id', getSpecificBook);
app.get('/pages/books/show', showBooks);
app.get('/pages/searches/new', queryNewBooks);
app.post('/search', findBooks);
app.post('/books', addBooks);
app.put('/books/:id', updateBooks);
app.delete('/books/:id', deleteBook);


//#region Route Functions
function updateBooks(req, res){
  const {title, author, isbn, image_url, description, summary} = req.body;
  const {id} = req.params;
  const sqlArr = [
    id,title, description, author, isbn, image_url,summary ];
  const SQL = `UPDATE books 
  SET title=$2 ,
  description=$3,
  author=$4,
  isbn=$5,
  image_url=$6,
  summary=$7
  WHERE id=$1;`;

  client.query(SQL,sqlArr)
  .then(()=>{
    res.redirect(`/books/${id}`);
  })
}

function deleteBook(req, res){
  // console.log('query', req.query)
  // console.log('body',req.body)
  // console.log('params',req.params)
  const sqlString = `DELETE FROM books WHERE id=$1;`;
  const sqlArray = [req.params.id];
  client.query(sqlString, sqlArray)
    .then(()=> {  
      console.log('deleted book');
      res.redirect('/');
    })
    .catch(error => handleError(error, res)); 
}

function addBooks(req, res) {
  const sqlString = 'INSERT INTO books(author,title,isbn,image_url,description,summary) VALUES($1,$2,$3,$4,$5,$6) RETURNING id;';
  const sqlArray =
    [
      req.body.author,
      req.body.title,
      req.body.isbn,
      req.body.image,
      req.body.description,
      req.body.summary
    ];
    console.log(sqlArray);
  client.query(sqlString, sqlArray)
    .then((result) => {
      console.log(`Stored ${req.body.title} into database`);
      res.redirect(`/books/${result.rows[0].id}`);
    })
    .catch(error => handleError(error, res));
}

function findBooks(req, res) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.selectionType}:${req.body.query}`;
  superagent.get(url)
    .then(data => {
      const newBookList = getBookList(data.body.items);
      const ejsObject = { books: newBookList };
      res.render('./pages/searches/show.ejs', ejsObject);
    })
    .catch(error => handleError(error, res));
}

const books = [];
function showBooks(req, res) {
  const ejsObject = { books: books };
  res.render('./pages/books/show.ejs', ejsObject);
}

function queryNewBooks(req, res) {
  res.render('./pages/searches/new.ejs');
}


function getCurrentBooks(req, res) {
  const sqlString = 'SELECT * FROM books ;';
  const sqlArray = [];
  client.query(sqlString, sqlArray)
    .then(result => {
      const ejsObject = { currentBooks: result.rows, totalBooks: result.rowCount };
      res.render('./pages/index.ejs', ejsObject);
    })
    .catch(error => handleError(error, res));
}

function getSpecificBook(req, res) {
  const sqlString = 'SELECT * FROM books WHERE id=$1;';
  const sqlArr = [req.params.id];
  client.query(sqlString, sqlArr)
    .then((result) => {
      const ejsObject = { specificBook: result.rows[0] };
      res.render('./pages/books/detail.ejs', ejsObject);
    })
    .catch(error => handleError(error, res));
}

function handleError(error, res) {
  console.log(error);
  res.render('./pages/error.ejs');
}
//#endregion

//#region Constructor Functions
function getBookList(bookInfo) {
  //How to check for null results
  return bookInfo.map(book => {
    let newISBN = book.volumeInfo.industryIdentifiers ?
      book.volumeInfo.industryIdentifiers[0].type + "-" + book.volumeInfo.industryIdentifiers[0].identifier :
      'No ISBN';
    let summary = book.searchInfo ? book.searchInfo.textSnippet :
    (book.volumeInfo.description ? book.volumeInfo.description.substring(0,50)+"..." : "No description available" );
    return new Book(
      book.volumeInfo.title,
      book.volumeInfo.authors,
      book.volumeInfo.description,
      book.volumeInfo.imageLinks,
      newISBN,
      summary,
    )
  });

}


function Book(title, authors, description, image, isbn, summary) {
  let dummyImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = title,
    this.image = image = image !== undefined ? image.thumbnail : dummyImage,
    this.authors = authors,
    this.description = description,
    this.isbn = isbn;
    this.summary = summary;
}

//#endregion
client.connect().then(() => {
  app.listen(PORT, () =>  console.log(`Listening on http://localhost:${PORT}`) );
});
