'use strict'

const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3001
const superagent = require('superagent');
const app = express();


app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/',(req,res)=>{
  res.render('./pages/index.js');
})

// app.get('/hello', (req, res) => {

//   res.render('./pages/index.ejs');
// })

const books = [];

app.get('/show', (req, res) => {
  const ejsObject = { books: books };
  res.render('./pages/searches/show.ejs', ejsObject);
})


app.get('/pages/searches/new', (req, res) => {
  res.render('./pages/searches/new.ejs');
});

app.post('/search', (req, res) => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.selectionType}:${req.body.query}`;
  superagent.get(url)
    .then(data => {

      const newBookList = getBookList(data.body.items);
      console.log(url);
      // res.redirect('/show');
      const ejsObject = { books: newBookList};
      res.render('./pages/searches/show.ejs', ejsObject);
    })
    .catch(error =>
      res.render('./pages/searches/error.ejs', error));
});

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

app.listen(PORT, () => {console.log(`Listening on http://localhost:${PORT}`);});
