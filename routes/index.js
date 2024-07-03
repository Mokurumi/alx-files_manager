import express from 'express';
import AppController from '../controllers/AppController';

const router = express.Router();

router.get('/status', (req, res) => {
  res.send(AppController.getStatus());
});

router.get('/stats', (req, res) => {
  res.send(AppController.getStats());
});

export default router;
