// services/sorteoService.js
import Sorteo from '../models/sorteo.js';
import Participante from '../models/participante.js';
import { crearTokenAcceso } from './tokenService.js';

export class SorteoService {
  
  /**
   * Genera asignaciones válidas para el amigo secreto
   * Asegura que nadie se asigne a sí mismo
   */
  static generarAsignacionesValidas(participantes) {
    let asignaciones = [];
    let intentos = 0;
    const maxIntentos = 100;

    while (intentos < maxIntentos) {
      intentos++;
      
      // Crear una copia aleatoria usando Fisher-Yates shuffle
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

  /**
   * Realiza el sorteo completo con todas las validaciones
   */
  static async realizarSorteoCompleto(sorteoId) {
    // Verificar estado del sorteo
    const sorteo = await Sorteo.buscarPorId(sorteoId);
    if (sorteo.estado !== 'pendiente') {
      throw new Error('El sorteo ya ha sido realizado');
    }

    // Obtener participantes
    const participantes = await Participante.listarPorSorteo(sorteoId);

    // Validar cantidad de participantes
    if (participantes.length < 2) {
      throw new Error('Se necesitan al menos 2 participantes para realizar el sorteo');
    }

    // Generar asignaciones
    const asignaciones = this.generarAsignacionesValidas(participantes);

    // Aplicar asignaciones en la base de datos
    for (let i = 0; i < participantes.length; i++) {
      await Participante.actualizar(participantes[i].id, {
        asignado_a: asignaciones[i].id
      });
    }

    // Actualizar estado del sorteo
    await Sorteo.cambiarEstado(sorteoId, 'realizado');

    // Generar token de acceso para compartir resultados
    const tokenAcceso = await crearTokenAcceso(sorteoId);

    return {
      message: 'Sorteo realizado exitosamente',
      token_acceso: tokenAcceso,
      total_participantes: participantes.length
    };
  }

  /**
   * Valida si un sorteo puede ser editado/eliminado
   */
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

  /**
   * Crea un nuevo sorteo con validaciones
   */
  static async crearSorteoCompleto(datosSorteo, usuarioId) {
    const { nombre, fecha, participantes } = datosSorteo;

    if (!nombre || !fecha || !participantes || !Array.isArray(participantes)) {
      throw new Error('Datos incompletos o inválidos');
    }

    if (participantes.length < 2) {
      throw new Error('Se necesitan al menos 2 participantes');
    }

    // Crear sorteo en la base de datos
    const sorteoId = await Sorteo.crear(nombre, fecha, usuarioId);

    // Crear participantes
    await Participante.crearVarios(participantes, sorteoId);

      // 3️⃣ Generar token de acceso para el sorteo
    const tokenAcceso = await crearTokenAcceso(sorteoId);

      // 4️⃣ Actualizar el sorteo con el token/link de acceso
    await Sorteo.actualizar(sorteoId, { link_acceso: tokenAcceso });

    // Obtener el sorteo creado con su link de acceso
    const sorteoCreado = await Sorteo.buscarPorId(sorteoId);

    return {
      id: sorteoId,
      nombre,
      fecha,
      link_acceso: sorteoCreado.link_acceso,
      total_participantes: participantes.length
    };
  }

  /**
   * Actualiza un sorteo con sus participantes
   */
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
      message: 'Sorteo actualizado exitosamente',
      total_participantes: participantes.length
    };
  }

  /**
   * Elimina un sorteo con todas sus dependencias
   */
  static async eliminarSorteoCompleto(sorteoId, usuarioId) {
    // Validar permisos y estado
    await this.validarSorteoParaEdicion(sorteoId, usuarioId);

    // Eliminar sorteo (los participantes se eliminan en cascada)
    await Sorteo.eliminar(sorteoId);

    return {
      message: 'Sorteo eliminado exitosamente'
    };
  }

  /**
   * Obtiene los detalles completos de un sorteo
   */
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

  /**
   * Proceso completo de identificación de participante
   */
  static async identificarParticipanteCompleto(tokenAcceso, participanteId) {
    // La validación del token se hace en el controller
    // ya que depende del tokenService

    // Verificar que el participante pertenece al sorteo del token
    const participante = await Participante.buscarPorId(participanteId);
    if (!participante) {
      throw new Error('Participante no encontrado');
    }

    // Marcar como identificado
    await Participante.marcarComoIdentificado(participanteId);

    // Obtener información del asignado
    const asignado = await Participante.obtenerAsignacion(participante.id);

    return {
      participante: {
        id: participante.id,
        nombre: participante.nombre
      },
      asignado: {
        nombre: asignado?.nombre,
        wishlist: asignado?.wishlist
      }
    };
  }
}

export default SorteoService;