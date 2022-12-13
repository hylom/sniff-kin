import express from 'express';
import { connectionLog } from '../module/connection-log.js';

export const apiHandlers = express.Router();
apiHandlers.get('/logs', getLogs);

function setCorsHeader(req, res) {
  res.append('Access-Control-Allow-Origin', '*');
}

async function getLogs(req, res, next) {
  let logs;
  const lastId = req.query.last_id;
  const query = {};
  if (lastId) {
    query.lastId = lastId;
  }
  try {
    logs = await connectionLog.getLogs(query);
  } catch (err) {
    res.status(500).json(err).end();
    next();
    return;
  }

  setCorsHeader(req, res);
  res.status(200).send(logs).end();
  next();
}

