import express from "express";
import { registrar, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/registrar', registrar);
router.post('/login', login);

// Opcional: puedes mantener tu endpoint de status si lo necesitas
router.get("/status", (req, res) => {
	res.json({ ok: true, message: "Auth routes reachable" });
});

export default router;