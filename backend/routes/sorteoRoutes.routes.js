import express from "express";
import authMiddleware from '../middleware/authMiddleware.js';
import {
  crearSorteo,
  obtenerSorteosUsuario,
  obtenerSorteo,
  actualizarSorteo,
  eliminarSorteo,
  realizarSorteo,
  accederConToken,
  identificarParticipante,
  obtenerBolillo,
  actualizarWishlist
} from '../controllers/sorteoController.js';

const router = express.Router();

// Rutas públicas con tokens (NO requieren autenticación)
router.post('/acceder', accederConToken);
router.post('/identificar', identificarParticipante);
router.get('/bolillo/:token', obtenerBolillo);
router.put('/bolillo/:token/wishlist', actualizarWishlist);

// Rutas protegidas (requieren autenticación)
router.use(authMiddleware);
router.post('/', crearSorteo);
router.get('/', obtenerSorteosUsuario);
router.get('/:id', obtenerSorteo);
router.put('/:id', actualizarSorteo);
router.delete('/:id', eliminarSorteo);
router.post('/:id/sortear', realizarSorteo);

export default router;
