import express from 'express';
import { connectionLog } from '../module/connection-log.js';

export const apiHandlers = express.Router();
apiHandlers.get('/logs', getLogs);

function setCorsHeader(req, res) {
  res.append('Access-Control-Allow-Origin', '*');
}

async function getLogs(req, res, next) {
  let logs;
  try {
    logs = await connectionLog.getLogs();
  } catch (err) {
    res.status(500).json(err).end();
    next();
    return;
  }

  setCorsHeader(req, res);
  res.status(200).send(logs).end();
  next();
}
