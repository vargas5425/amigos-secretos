import SorteoService from '../services/sorteoService.js';
import { 
  validarTokenAcceso, 
  crearTokenBolillo,
  validarTokenBolillo 
} from '../services/tokenService.js';
import Participante from '../models/participante.js';
import Sorteo from '../models/sorteo.js';

const crearSorteo = async (req, res, next) => {
  try {
    const resultado = await SorteoService.crearSorteoCompleto(
      req.body, 
      req.usuario.id
    );
    
    res.status(201).json({
      message: 'Sorteo creado exitosamente',
      sorteo: resultado
    });
  } catch (error) {
    next(error);
  }
};

const obtenerSorteosUsuario = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const sorteos = await Sorteo.listarPorUsuario(usuarioId);
    res.json({ sorteos });
  } catch (error) {
    next(error);
  }
};

const obtenerSorteo = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const resultado = await SorteoService.obtenerDetallesSorteo(
      id, 
      req.usuario.id
    );
    
    res.json({ sorteo: resultado });
  } catch (error) {
    next(error);
  }
};

const actualizarSorteo = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const resultado = await SorteoService.actualizarSorteoCompleto(
      id, 
      req.body, 
      req.usuario.id
    );
    
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

const eliminarSorteo = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const resultado = await SorteoService.eliminarSorteoCompleto(
      id, 
      req.usuario.id
    );
    
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

const realizarSorteo = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar propiedad primero (esto podría moverse a middleware)
    const esPropietario = await Sorteo.verificarPropiedad(id, req.usuario.id);
    if (!esPropietario) {
      return res.status(404).json({ error: 'Sorteo no encontrado' });
    }

    const resultado = await SorteoService.realizarSorteoCompleto(id);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

const accederConToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    const tokenData = await validarTokenAcceso(token);
    if (!tokenData) {
      return res.status(401).json({ error: 'Token de acceso inválido o ya usado' });
    }

    // Obtener sorteo (sin verificación de usuario para acceso público)
    const sorteo = await Sorteo.buscarPorId(tokenData.sorteo_id);
    
    // Obtener participantes no identificados
    const participantes = await Participante.listarNoIdentificados(tokenData.sorteo_id);

    res.json({
      sorteo: {
        id: sorteo.id,
        nombre: sorteo.nombre,
        fecha: sorteo.fecha
      },
      participantes,
      token_acceso: token
    });
  } catch (error) {
    next(error);
  }
};

const identificarParticipante = async (req, res, next) => {
  try {
    const { token_acceso, participante_id } = req.body;

    // Validar token de acceso
    const tokenData = await validarTokenAcceso(token_acceso);
    if (!tokenData) {
      return res.status(401).json({ error: 'Token de acceso inválido' });
    }

    // Procesar identificación
    const resultado = await SorteoService.identificarParticipanteCompleto(
      token_acceso, 
      participante_id
    );

    // Generar token de bolillo
    const tokenBolillo = await crearTokenBolillo(participante_id);

    res.json({
      message: 'Participante identificado exitosamente',
      token_bolillo: tokenBolillo,
      asignado: resultado.asignado
    });
  } catch (error) {
    next(error);
  }
};

const obtenerBolillo = async (req, res, next) => {
  try {
    const { token } = req.params;

    const participante = await validarTokenBolillo(token);
    if (!participante) {
      return res.status(404).json({ error: 'Token de bolillo inválido' });
    }

    // Obtener información completa del participante y su asignado
    const participanteCompleto = await Participante.buscarPorId(participante.id);
    const asignado = await Participante.obtenerAsignacion(participante.id);

    res.json({
      participante: {
        nombre: participanteCompleto.nombre,
        wishlist: participanteCompleto.wishlist,
        asignado: {
          nombre: asignado?.nombre,
          wishlist: asignado?.wishlist
        },
        token_bolillo: token
      }
    });
  } catch (error) {
    next(error);
  }
};

const actualizarWishlist = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { wishlist } = req.body;

    const participante = await validarTokenBolillo(token);
    if (!participante) {
      return res.status(404).json({ error: 'Token de bolillo inválido' });
    }

    await Participante.actualizarWishlist(participante.id, wishlist);
    
    console.log("🌀 Wishlist actualizada para participante:", participante.id);
    res.json({ message: 'Wishlist actualizada exitosamente' });

  } catch (error) {
    next(error);
  }
};

export {
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
};