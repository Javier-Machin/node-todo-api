const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

// the .expect calls are handled by supertest, and expect() by the expect library

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  })
});


describe('GET /todos/:id', () => {
  it('should return one todo', (done) => {
    const validId = todos[0]._id;

    request(app)
      .get(`/todos/${validId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return a todo created by other user', (done) => {
    const validId = todos[1]._id;

    request(app)
      .get(`/todos/${validId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should respond with 404 for invalid id', (done) => {
    const invalidId = '12345abc';

    request(app)
      .get(`/todos/${invalidId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  })

  it('should respond with 404 for todo not found', (done) => {
    // works without .toHexString()
    const validNonExistentId = new ObjectID();

    request(app)
      .get(`/todos/${validNonExistentId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  })
});


describe('DELETE /todos/:id', () => {
  it('should remove one todo', (done) => {
    const validId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${validId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(validId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(validId).then((todo) => {
          expect(todo).toBeFalsy();
          done();
        }).catch((e) => done(e));
      })
  });

  it('should not remove a todo created by other user', (done) => {
    const validId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${validId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        Todo.findById(validId).then((todo) => {
          expect(todo).toBeTruthy();
          done();
        }).catch((e) => done(e));
      })
  });
  
  it('should respond with 404 for invalid id', (done) => {
    const invalidId = '12345abc';

    request(app)
      .delete(`/todos/${invalidId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should respond with 404 for todo not found', (done) => {
    // works without .toHexString()
    const validNonExistentId = new ObjectID();
    
    request(app)
      .delete(`/todos/${validNonExistentId}`)
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .send(data)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).not.toBe(todos[0].text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      }).end(done);
  });

  it('should not update a todo created by other user', (done) => {
    const validId = todos[1]._id.toHexString();
    
    const data = {
      text: 'updated text',
      completed: true
    }

    request(app)
      .patch(`/todos/${validId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(data)
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    const validId = todos[1]._id.toHexString();
    
    const data = {
      text: 'updated text',
      completed: false
    } 

    request(app)
    .patch(`/todos/${validId}`)
    .set('x-auth', users[1].tokens[0].token)
    .send(data)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(data.text);
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toBeFalsy();
    }).end(done);
  });
});


describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});


describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'example@example.com';
    const password = '123mnb!';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    // invalid email
    const email = 'examplecom';
    const password = '123mnb!';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    // already in use email from seeds
    const email = users[0].email;
    const password = '123456';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect (res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      })
  });

  it('should reject invalid login', (done) => {
    const invalidCredentials = {
      email: users[1].email,
      password: 'aaaaaa'
    };
    
    request(app)
      .post('/users/login')
      .send(invalidCredentials)
      .expect(400)
      .expect((res) => {
        expect (res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1)
          done();
        }).catch((e) => done(e));
      })
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});