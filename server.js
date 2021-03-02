'use strict'

const express = require('express');
const PORT = 3001;
const superagent = require('superagent');
const app = express();

require('dotenv').config();

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');


app.get('/hello', (req, res) => {

  res.render('./pages/index.ejs');
})


app.get('/bookData', (req, res) => {

  const url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${req.query}`;

  superagent.get(url)
    .then(data => {
      res.send(data.body)
      console.log(data.body);
    });
});
const books = [];



app.get('/new', (req, res) => {
  res.render('./pages/searches/new.ejs');
});

app.post('/search', (req, res) => {
  let target = '';
  switch (req.body.selectionType) {
  case '1':
    target = 'author';
    break;
  case '2':
    target = 'title';
    break;
  }
  const url = `https://www.googleapis.com/books/v1/volumes?q=in${target}:${req.body.query}`;
  console.log(url);
  superagent.get(url)
    .then(data => {
      // const title = data.body.items[0].volumeInfo.title;
      // const authors = data.body.items[0].volumeInfo.authors;
      // const description = data.body.items[0].volumeInfo.description;
      const newBookList = getBookList(data.body.items);
      res.send(newBookList);
  })
  .catch(error =>
    console.log('something went wrong', error));
});
function getBookList(bookInfo){
  return bookInfo.map (book => {
    return new Book(book.volumeInfo.title, book.volumeInfo.authors, book.volumeInfo.description)
  });

}
function Book(title, authors, description){
  this.title = title,
  this.authors = authors,
  this.discription = description
}

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));