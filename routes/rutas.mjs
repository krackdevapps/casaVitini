import express from 'express';
import { calendarios_compartidos } from '../logica/controllers/calendarios_compartidos.mjs';
import { puerto } from '../logica/controllers/puerto.mjs';
import { arranque } from '../logica/controllers/arranque.mjs';

export const router = express.Router();
router.get('/calendarios_compartidos/:href(*)', calendarios_compartidos)
router.get('/:href(*)', arranque);
router.post('/puerto', puerto)



