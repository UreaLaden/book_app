'use strict'

const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT;
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
  superagent.get(url)
    .then(data => {
      const newBookList = getBookList(data.body.items);

      res.redirect('/show');
    })
    .catch(error =>
      console.log('something went wrong', error));
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
  let dummyImage = "https://i.imgur.com/J5LVHEL.jpg";
  let hasImage = image === undefined;
  let newImage = !hasImage ? image.thumbnail : dummyImage;
  this.title = title,
  this.image = newImage;
  this.authors = authors,
  this.discription = description
  console.log(image);
  books.push(
    {
      title: title,
      image: newImage,
      authors: authors,
      description: description
    });

}

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));