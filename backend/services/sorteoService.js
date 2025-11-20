import Sorteo from '../models/sorteo.js';
import Participante from '../models/participante.js';
import { crearTokenAcceso,marcarTokenComoUsado } from './tokenService.js';
import { getDb } from '../config/db.js';

export class SorteoService {
  
  /*Asegura que nadie se asigne a sí mismo*/
  static generarAsignacionesValidas(participantes) {
    let asignaciones = [];
    let intentos = 0;
    const maxIntentos = 100;

    while (intentos < maxIntentos) {
      intentos++;
      
      // Crear una copia aleatoria para asignacion
      const copia = [...participantes];
      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
      }

      // Validar que nadie se asigne a sí mismo
      const esValida = participantes.every((participante, index) => 
        participante.id !== copia[index].id
      );

      if (esValida) {
        asignaciones = copia;
        break;
      }
    }

    if (asignaciones.length === 0) {
      throw new Error('No se pudo generar una asignación válida después de ' + maxIntentos + ' intentos');
    }

    return asignaciones;
  }

  //Realiza el sorteo completo con todas las validaciones
static async realizarSorteoCompleto(sorteoId) {
  // Verificar estado del sorteo
  const sorteo = await Sorteo.buscarPorId(sorteoId);
  if (sorteo.estado !== 'pendiente') {
    throw new Error('El sorteo ya ha sido realizado');
  }

  // Obtener participantes
  const participantes = await Participante.listarPorSorteo(sorteoId);

  // Generar asignaciones válidas
  const asignaciones = this.generarAsignacionesValidas(participantes);

  // Guardar asignaciones en la base de datos
  for (let i = 0; i < participantes.length; i++) {
    await Participante.actualizar(participantes[i].id, {
      asignado_a: asignaciones[i].id
    });
  }

  // Actualizar estado del sorteo
  await Sorteo.cambiarEstado(sorteoId, 'realizado');

  // Marcar cualquier token viejo como usado
  const db = getDb();
  await new Promise((resolve, reject) => {
    db.run(
      'UPDATE tokens_acceso SET usado = TRUE WHERE sorteo_id = ?',
      [sorteoId],
      function(err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // Generar nuevo token de acceso
  const tokenAcceso = await crearTokenAcceso(sorteoId);

  // Guardar token en el sorteo
  await Sorteo.actualizar(sorteoId, { link_acceso: tokenAcceso });

  return {
    message: 'Sorteo realizado exitosamente',
    token_acceso: tokenAcceso,
    total_participantes: participantes.length
  };
}

  // Validar si un sorteo puede ser editado o eliminado
  static async validarSorteoParaEdicion(sorteoId, usuarioId) {
    const esPropietario = await Sorteo.verificarPropiedad(sorteoId, usuarioId);
    if (!esPropietario) {
      throw new Error('Sorteo no encontrado');
    }

    const puedeEditar = await Sorteo.puedeEditar(sorteoId);
    if (!puedeEditar) {
      throw new Error('No se puede modificar un sorteo ya realizado');
    }

    return true;
  }
  /*============================================
                    CRUD DE SORTEO
    =============================================*/ 

  // Crear un nuevo sorteo con validaciones
    static async crearSorteoCompleto(datosSorteo, usuarioId) {
  const { nombre, fecha, participantes } = datosSorteo;

  if (!nombre || !fecha || !participantes || !Array.isArray(participantes)) {
    throw new Error('Datos incompletos o inválidos');
  }

  // Crear sorteo en la base de datos, link_acceso = null
  const sorteoId = await Sorteo.crearSorteo(nombre, fecha, usuarioId, null);

  // Crear participantes
  await Participante.crearVarios(participantes, sorteoId);

  // Obtener el sorteo creado
  const sorteoCreado = await Sorteo.buscarPorId(sorteoId);

  return {
    id: sorteoId,
    nombre,
    fecha,
    total_participantes: participantes.length
  };
}

  //Actualiza un sorteo con sus participantes
  static async actualizarSorteoCompleto(sorteoId, datosActualizacion, usuarioId) {
    const { nombre, fecha, participantes } = datosActualizacion;

    // Validar permisos y estado
    await this.validarSorteoParaEdicion(sorteoId, usuarioId);

    // Actualizar datos del sorteo
    await Sorteo.actualizar(sorteoId, { nombre, fecha });

    // Recrear participantes (eliminar existentes y crear nuevos)
    await Participante.eliminarPorSorteo(sorteoId);
    await Participante.crearVarios(participantes, sorteoId);

    return {
      total_participantes: participantes.length
    };
  }

  //Elimina un sorteo con todas sus dependencias
  static async eliminarSorteoCompleto(sorteoId, usuarioId) {
    // Validar permisos y estado
    await this.validarSorteoParaEdicion(sorteoId, usuarioId);

    // Eliminar sorteo (los participantes se eliminan en cascada)
    await Sorteo.eliminar(sorteoId);

    return {
      message: 'Sorteo eliminado exitosamente'
    };
  }

static async identificarParticipanteCompleto(tokenData, participanteId) {
  const { sorteo_id } = tokenData;

  // Buscar participante
  const participante = await Participante.buscarPorId(participanteId);
  if (!participante) throw new Error('Participante no encontrado');

  // Marcar como identificado
  await Participante.marcarComoIdentificado(participanteId);

  // Verificar si todos los participantes ya se identificaron
  const db = getDb();
  const row = await new Promise((resolve, reject) => {
    db.get(
      `SELECT 
         (SELECT COUNT(*) FROM participantes WHERE sorteo_id = ?) AS total,
         (SELECT COUNT(*) FROM participantes WHERE sorteo_id = ? AND identificado = 1) AS identificados`,
      [sorteo_id, sorteo_id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (row.identificados >= row.total) {
    // Buscar el token activo real
    const tokenActivo = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM tokens_acceso WHERE sorteo_id = ? AND usado = FALSE',
        [sorteo_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (tokenActivo) {
      await marcarTokenComoUsado(tokenActivo.id);
      console.log(`Token ${tokenActivo.id} marcado como usado. Todos los participantes ya se identificaron.`);
    }
  }

  // Obtener asignado
  const asignado = await Participante.obtenerAsignacion(participante.id);

  return {
    participante: { id: participante.id, nombre: participante.nombre },
    asignado: { nombre: asignado?.nombre, wishlist: asignado?.wishlist }
  };
}

  //Obtiene los detalles completos de un sorteo
  static async obtenerDetallesSorteo(sorteoId, usuarioId) {
    const sorteo = await Sorteo.buscarPorId(sorteoId);
    
    if (!sorteo) {
      throw new Error('Sorteo no encontrado');
    }

    // Verificar propiedad (excepto para tokens de acceso)
    if (usuarioId && sorteo.usuario_id !== usuarioId) {
      throw new Error('No autorizado para ver este sorteo');
    }

    const participantes = await Participante.listarPorSorteo(sorteoId);

    return {
      ...sorteo,
      participantes
    };
  }
}

export default SorteoService;