const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

const routes = express.Router();

routes.get('/status', (req, res) => {
  res.send(AppController.getStatus());
});

routes.get('/stats', (req, res) => {
  res.send(AppController.getStats());
});

routes.post('/users', (req, res) => {
  UsersController.postNew(req, res);
});

module.exports = routes;
