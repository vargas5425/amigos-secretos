import crypto from 'crypto';
import { getDb } from '../config/db.js';

const generarToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const hashSHA256 = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

const crearTokenAcceso = async (sorteoId) => {
  const db = getDb();
  const token = generarToken();
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO tokens_acceso (token, sorteo_id) VALUES (?, ?)',
      [token, sorteoId],
      function(err) {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
};

const validarTokenAcceso = async (token) => {
  const db = getDb();
  
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT t.*, s.* FROM tokens_acceso t 
       JOIN sorteos s ON t.sorteo_id = s.id 
       WHERE t.token = ? AND t.usado = FALSE`,
      [token],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

const marcarTokenComoUsado = async (tokenId) => {
  const db = getDb();
  
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE tokens_acceso SET usado = TRUE WHERE id = ?',
      [tokenId],
      function(err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

//crear token personal 
const crearTokenBolillo = async (participanteId) => {
  const db = getDb();
  const token = generarToken();
  
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE participantes SET token_bolillo = ? WHERE id = ?',
      [token, participanteId],
      function(err) {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
};

const validarTokenBolillo = async (token) => {
  const db = getDb();
  
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT p.*, s.nombre as sorteo_nombre 
       FROM participantes p 
       JOIN sorteos s ON p.sorteo_id = s.id 
       WHERE p.token_bolillo = ?`,
      [token],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

export {
  generarToken,
  hashSHA256,
  crearTokenAcceso,
  validarTokenAcceso,
  marcarTokenComoUsado,
  crearTokenBolillo,
  validarTokenBolillo,
};