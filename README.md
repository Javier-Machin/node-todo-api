# node-todo-api

NodeJS / Express todo RESTful API


To run it locally:

`$ npm install`

`$ npm start`

To run the test suite:

`$ npm run test-watch`

It's also deployed in Heroku: https://git.heroku.com/blooming-shelf-83566.git

Public Endpoints: 

POST `/users` - Body parameters: `{email:string, password:string}` - Create and log in new user

POST `/users/login` - Body parameters: `{email:string, password:string}` - Log in with the provided credentials

Private Endpoints (requires to be logged in, (x-auth header)):

GET `/todos` - A list of all todos by the current user 

GET `/todos/{id}` - The todo with the specified id 

POST `/todos` - Body parameters: `{text:string, completed:boolean}` - Create a new todo 

PATCH `/todos/{id}` - Body parameters: `{text:string, completed:boolean}` - Update the specified todo 

DELETE `/todos/{id}` - Delete the specified todo 

GET `/users/me` - The current logged in user

DELETE `/users/me/token` - It Removes logged in user's tokens

-------------------------------------------

Para ejecutarla localmente:

`$ npm install`

`$ npm start`

Para ejecutar los tests:

`$ npm run test-watch`

Está disponible en Heroku: https://git.heroku.com/blooming-shelf-83566.git

Endpoints públicos:

POST `/users` - Body parameters: `{email:string, password:string}` - Crea un nuevo usuario e inicia sesión 

POST `/users/login` - Body parameters: `{email:string, password:string}` - Inicia sesión con las credenciales especificadas

Endpoints privados (requiren estar logeado (x-auth header)):

GET `/todos` - Lista de todos los todos creados por el usuario con sesión activa

GET `/todos/{id}` - El todo con la id especificada

POST `/todos` - Body parameters: `{text:string, completed:boolean}` - Crea un nuevo todo

PATCH `/todos/{id}` - Body parameters: `{text:string, completed:boolean}` - Modifica el todo especificado

DELETE `/todos/{id}` - Elimina el todo especificado

GET `/users/me` - El usuario con sesión activa actualmente

DELETE `/users/me/token` - Elimina los tokens del usuario con sesión activa