import Usuario from '../models/usuario.js';

const registrar = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el email ya existe usando el modelo
    const usuarioExistente = await Usuario.existeEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Crear usuario usando el modelo
    const usuarioId = await Usuario.crear(nombre, email, password);

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      usuario: { id: usuarioId, nombre, email }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Validar credenciales usando el modelo
    const usuario = await Usuario.validarCredenciales(email, password);
    
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      message: 'Login exitoso',
      token: usuario.id.toString(),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
};

export { registrar, login };