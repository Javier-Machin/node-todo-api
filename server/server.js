require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;


// Add bodyParser middleware
app.use(bodyParser.json());


// /todos POST route, create new todo
app.post('/todos', authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});


// /todos GET route, get all todos for the current logged in user
app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});


// /todos/:id GET route, get one todo
app.get('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;

  // Validate id using isValid
    // if invalid, status 404 send empty send
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

  // previously findbyId
  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    // if no todo - send back 404 with empty body
    if (!todo) return res.status(404).send();
   
    // if todo - send it back
    res.send({ todo });

  }).catch((e) => {
    // 400 - and send empty body back
    res.status(400).send();
  });
});


// /todos/:id DELETE route, delete one todo
app.delete('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) return res.status(404).send();

  Todo.findOneAndDelete({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) return res.status(404).send();

    res.send({ todo });
  }).catch((e) => {
    res.status(400).send();
  });
});


// /todos/:id PATCH route, update one todo
app.patch('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  
  // sanitize params
  const body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) return res.status(404).send();

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({
     _id: id,
     _creator: req.user._id
    }, {
      $set: body
    }, {
      new: true
    }).then((todo) => {
    if (!todo) return res.status(404).send();

    res.send({ todo });
  }).catch((e) => {
    res.status(400).send();
  });
})


// /users POST route, create new User
app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  const user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});


// /users/me GET route, fetch current user
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});


// /users/login POST route, login as a user
app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };