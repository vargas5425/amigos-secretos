import { getDb } from '../config/db.js';
import { hashSHA256 } from '../services/tokenService.js';

class Usuario {
  static async crear(nombre, email, password) {
    const db = getDb();
    const passwordHash = hashSHA256(password);
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
        [nombre, email, passwordHash],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.lastID);
        }
      );
    });
  }

  static async buscarPorEmail(email) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM usuarios WHERE email = ?',
        [email],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });
  }

  static async buscarPorId(id) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, nombre, email, created_at FROM usuarios WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });
  }

  static async validarCredenciales(email, password) {
    const db = getDb();
    const passwordHash = hashSHA256(password);
    
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM usuarios WHERE email = ? AND password = ?',
        [email, passwordHash],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });
  }

  static async existeEmail(email) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM usuarios WHERE email = ?',
        [email],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(!!row);
        }
      );
    });
  }

  static async actualizar(id, datos) {
    const db = getDb();
    const campos = [];
    const valores = [];

    if (datos.nombre) {
      campos.push('nombre = ?');
      valores.push(datos.nombre);
    }

    if (datos.email) {
      campos.push('email = ?');
      valores.push(datos.email);
    }

    if (datos.password) {
      const passwordHash = hashSHA256(datos.password);
      campos.push('password = ?');
      valores.push(passwordHash);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
        valores,
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes);
        }
      );
    });
  }

  static async eliminar(id) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM usuarios WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes);
        }
      );
    });
  }

  static async listar() {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, nombre, email, created_at FROM usuarios ORDER BY created_at DESC',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });
  }
}

export default Usuario;