import { getDb } from '../config/db.js';

class Sorteo {
  static async crearSorteo(nombre, fecha, usuarioId, linkAcceso = null) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO sorteos (nombre, fecha, usuario_id, link_acceso) VALUES (?, ?, ?, ?)',
        [nombre, fecha, usuarioId, linkAcceso],
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

  static async buscarPorId(id) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT s.*, 
                u.nombre as usuario_nombre,
                (SELECT COUNT(*) FROM participantes p WHERE p.sorteo_id = s.id) as total_participantes,
                (SELECT COUNT(*) FROM participantes p WHERE p.sorteo_id = s.id AND p.identificado = TRUE) as identificados
         FROM sorteos s 
         LEFT JOIN usuarios u ON s.usuario_id = u.id 
         WHERE s.id = ?`,
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

  static async buscarPorLinkAcceso(linkAcceso) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM sorteos WHERE link_acceso = ?',
        [linkAcceso],
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

  static async listarPorUsuario(usuarioId) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT s.*, 
                (SELECT COUNT(*) FROM participantes p WHERE p.sorteo_id = s.id) as total_participantes,
                (SELECT COUNT(*) FROM participantes p WHERE p.sorteo_id = s.id AND p.asignado_a IS NOT NULL) as asignados
         FROM sorteos s 
         WHERE s.usuario_id = ? 
         ORDER BY s.created_at DESC`,
        [usuarioId],
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

  static async actualizar(id, datos) {
    const db = getDb();
    const campos = [];
    const valores = [];

    if (datos.nombre) {
      campos.push('nombre = ?');
      valores.push(datos.nombre);
    }

    if (datos.fecha) {
      campos.push('fecha = ?');
      valores.push(datos.fecha);
    }

    if (datos.estado) {
      campos.push('estado = ?');
      valores.push(datos.estado);
    }

    if (datos.link_acceso) {
      campos.push('link_acceso = ?');
      valores.push(datos.link_acceso);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE sorteos SET ${campos.join(', ')} WHERE id = ?`,
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
        'DELETE FROM sorteos WHERE id = ?',
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

  static async cambiarEstado(id, estado) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE sorteos SET estado = ? WHERE id = ?',
        [estado, id],
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

  static async verificarPropiedad(sorteoId, usuarioId) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM sorteos WHERE id = ? AND usuario_id = ?',
        [sorteoId, usuarioId],
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

  static async puedeEditar(sorteoId) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT estado FROM sorteos WHERE id = ?',
        [sorteoId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row && row.estado === 'pendiente');
        }
      );
    });
  }

  static async obtenerEstadisticas(usuarioId) {
    const db = getDb();
    
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as total_sorteos,
          SUM(CASE WHEN estado = 'realizado' THEN 1 ELSE 0 END) as sorteos_realizados,
          SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as sorteos_pendientes
         FROM sorteos 
         WHERE usuario_id = ?`,
        [usuarioId],
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

export default Sorteo;