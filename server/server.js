const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

// Add bodyParser middleware
app.use(bodyParser.json());


// /todos POST route, create new todo
app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});


// /todos GET route, get all todos
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});


// /todos/:id GET route, get one todo
app.get('/todos/:id', (req, res) => {
  const id = req.params.id;

  // Validate id using isValid
    // if invalid, status 404 send empty send
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

  // findbyId
  Todo.findById(id).then((todo) => {
    // if no todo - send back 404 with empty body
    if (!todo) {
      return res.status(404).send();
    }
   
    // if todo - send it back
    res.send({ todo });

    // error
    // 400 - and send empty body back
  }).catch((e) => {
    res.status(400).send();
  });
});


app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };