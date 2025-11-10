import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.routes.js";
import sorteoRoutes from "./routes/sorteoRoutes.routes.js";
import errorMiddleware from "./middleware/errorHandler.js";

// Configuración base
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/sorteos", sorteoRoutes);

// Middleware de errores
app.use(errorMiddleware);

// Arrancar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
