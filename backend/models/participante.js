import { getDb } from '../config/db.js';

class Participante {
  static async crearVarios(participantes, sorteoId) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      const stmt = db.prepare('INSERT INTO participantes (nombre, sorteo_id) VALUES (?, ?)');
      
      participantes.forEach(participante => {
        stmt.run([participante, sorteoId]);
      });
      
      stmt.finalize((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  static async buscarPorId(id) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM participantes WHERE id = ?',
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

  static async actualizar(id, datos) {
    const db = getDb();
    const campos = [];
    const valores = [];

    if (datos.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(datos.nombre);
    }

    if (datos.asignado_a !== undefined) {
      campos.push('asignado_a = ?');
      valores.push(datos.asignado_a);
    }

    if (datos.wishlist !== undefined) {
      campos.push('wishlist = ?');
      valores.push(datos.wishlist);
    }

    if (datos.identificado !== undefined) {
      campos.push('identificado = ?');
      valores.push(datos.identificado);
    }

    if (datos.token_bolillo !== undefined) {
      campos.push('token_bolillo = ?');
      valores.push(datos.token_bolillo);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE participantes SET ${campos.join(', ')} WHERE id = ?`,
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
        'DELETE FROM participantes WHERE id = ?',
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

  static async listarPorSorteo(sorteoId) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT p.*, 
                pa.nombre as asignado_nombre,
                pa.wishlist as wishlist_asignado
         FROM participantes p 
         LEFT JOIN participantes pa ON p.asignado_a = pa.id
         WHERE p.sorteo_id = ? 
         ORDER BY p.id`,
        [sorteoId],
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

  static async listarNoIdentificados(sorteoId) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT p.*, pa.nombre as asignado_nombre
         FROM participantes p 
         LEFT JOIN participantes pa ON p.asignado_a = pa.id
         WHERE p.sorteo_id = ? AND p.identificado = FALSE`,
        [sorteoId],
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

  static async eliminarPorSorteo(sorteoId) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM participantes WHERE sorteo_id = ?',
        [sorteoId],
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

  static async marcarComoIdentificado(id) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE participantes SET identificado = TRUE WHERE id = ?',
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

  static async actualizarWishlist(id, wishlist) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE participantes SET wishlist = ? WHERE id = ?',
        [wishlist, id],
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

  static async obtenerAsignacion(participanteId) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT pa.nombre, pa.wishlist
         FROM participantes p 
         JOIN participantes pa ON p.asignado_a = pa.id
         WHERE p.id = ?`,
        [participanteId],
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
}

export default Participante;