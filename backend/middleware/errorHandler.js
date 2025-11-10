const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de base de datos
  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(400).json({ 
      error: 'Error de base de datos',
      detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Datos de entrada inválidos',
      detalles: err.message
    });
  }

  // Error genérico
  res.status(500).json({ 
    error: 'Error interno del servidor',
    detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

export default errorMiddleware;