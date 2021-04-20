const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExists = users.find(user => user.username === username);
  if (!userExists) {
    return response.status(404).json({ error: 'User not found!' });
  }
  request.user = userExists;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.find(user => user.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists!' });
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const todos = user.todos;
  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id: todoId } = request.params;
  const { user } = request;
  const todoExists = user.todos.find(todo => todo.id === todoId);
  if (!todoExists) {
    return response.status(404).json({ error: 'Todo not found!' })
  }
  todoExists.title = title;
  todoExists.deadline = deadline;
  return response.status(201).json(todoExists);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id: todoId } = request.params;
  const { user } = request;
  const todoExists = user.todos.find(todo => todo.id === todoId);
  if (!todoExists) {
    return response.status(404).json({ error: 'Todo not found!' })
  }
  todoExists.done = true;
  return response.status(201).json(todoExists);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id: todoId } = request.params;
  const { user } = request;
  const todoIndex = user.todos.findIndex(todo => todo.id === todoId);
  if (todoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found!' })
  }
  user.todos.splice(todoIndex, 1);
  return response.status(204).json();
});

module.exports = app;