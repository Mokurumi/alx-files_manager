const express = require('express');
const AppController = require('../controllers/AppController');

const routes = express.Router();

routes.get('/status', (req, res) => {
  res.send(AppController.getStatus());
});

routes.get('/stats', (req, res) => {
  res.send(AppController.getStats());
});

export default routes;
