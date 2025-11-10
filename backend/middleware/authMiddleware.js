import { getDb } from '../config/db.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    const db = getDb();
    
    db.get(
      'SELECT id, nombre, email FROM usuarios WHERE id = ?',
      [token],
      (err, usuario) => {
        if (err) {
          console.error('Error en auth middleware:', err);
          return res.status(500).json({ error: 'Error del servidor' });
        }
        
        if (!usuario) {
          return res.status(401).json({ error: 'Token inválido' });
        }
        
        req.usuario = usuario;
        next();
      }
    );
  } catch (error) {
    console.error('Error en auth middleware:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

export default authMiddleware;