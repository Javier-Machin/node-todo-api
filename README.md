# node-todo-api

NodeJS / Express todo RESTful API


To run it locally:

`$ npm install`

`$ npm start`

To run the test suite:

`$ npm run test-watch`

It's also deployed in Heroku: https://git.heroku.com/blooming-shelf-83566.git

Endpoints:

GET `/todos` - A list of all todos

GET `/todos/{id}` - The todo with the specified id

POST `/todos` - Body parameters: `{text:string, completed:boolean}` - Create a new todo

PATCH `/todos/{id}` - Body parameters: `{text:string, completed:boolean}` - Update the specified todo

DELETE `/todos/{id}` - Delete the specified todo

-------------------------------------------

Para ejecutarla localmente:

`$ npm install`

`$ npm start`

Para ejecutar los tests:

`$ npm run test-watch`

Está disponible en Heroku: https://git.heroku.com/blooming-shelf-83566.git

Endpoints:

GET `/todos` - Lista de todos los todos

GET `/todos/{id}` - El todo con la id especificada

POST `/todos` - Body parameters: `{text:string, completed:boolean}` - Crea un nuevo todo

PATCH `/todos/{id}` - Body parameters: `{text:string, completed:boolean}` - Modifica el todo especificado

DELETE `/todos/{id}` - Elimina el todo especificado