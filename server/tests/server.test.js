const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a todo with invalid body data', (done) => {
    // invalid data
    const text = '';

    request(app)
      .post('/todos')
      .send({ text })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
    });
  });

});


describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  })
});


describe('GET /todos/:id', () => {
  it('should return one todo', (done) => {
    const validId = todos[0]._id;

    request(app)
      .get(`/todos/${validId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should respond with 404 for invalid id', (done) => {
    const invalidId = '12345abc';

    request(app)
      .get(`/todos/${invalidId}`)
      .expect(404)
      .end(done);
  })

  it('should respond with 404 for todo not found', (done) => {
    // works without .toHexString()
    const validNonExistentId = new ObjectID();

    request(app)
      .get(`/todos/${validNonExistentId}`)
      .expect(404)
      .end(done);
  })
});


describe('DELETE /todos/:id', () => {
  it('should remove one todo', (done) => {
    const validId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${validId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(validId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(validId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      })
  });
  
  it('should respond with 404 for invalid id', (done) => {
    const invalidId = '12345abc';

    request(app)
      .delete(`/todos/${invalidId}`)
      .expect(404)
      .end(done);
  });

  it('should respond with 404 for todo not found', (done) => {
    // works without .toHexString()
    const validNonExistentId = new ObjectID();
    
    request(app)
      .delete(`/todos/${validNonExistentId}`)
      .expect(404)
      .end(done);
  });
});


describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    const validId = todos[0]._id.toHexString();
    
    const data = {
      text: 'updated text',
      completed: true
    }

    request(app)
      .patch(`/todos/${validId}`)
      .send(data)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toNotBe(todos[0].text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      }).end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    const validId = todos[1]._id.toHexString();
    
    const data = {
      text: 'updated text',
      completed: false
    } 

    request(app)
    .patch(`/todos/${validId}`)
    .send(data)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toNotBe(todos[1].text);
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toNotExist();
    }).end(done);
  });
});