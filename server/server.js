const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true });

const Todo = mongoose.model('Todo', {
  text: {
    type: String
  },
  completed: { 
    type: Boolean 
  },
  completedAt: {
    type: Number 
  }
});

const newTodo = new Todo({
  text: 'Cook dinner'
})

newTodo.save().then((doc) => {
  console.log('Saved todo', doc);
}, (e) => {
  console.log('Unable to save todo', e);
});


const otherTodo = new Todo({
  text: 'Walk the dog',
  completed: false,
  completedAt: Date.parse(new Date)
});

otherTodo.save().then((doc) => {
  console.log('Saved todo', doc);
}, (e) => {
  console.log('Unable to save todo', e);
})