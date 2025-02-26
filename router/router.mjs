import express from 'express';
import { calendarios_compartidos } from './routes/calendarios_compartidos.mjs';
import { puerto } from './routes/puerto.mjs';
import { arranque } from './routes/arranque.mjs';
import { robots } from './routes/robots.mjs';
import { obtenerWebCom } from '../src/application/componentes/obtenerWebCom.mjs';

export const router = express.Router();
router.get('/calendarios_compartidos/:href(*)', calendarios_compartidos)
router.get('/robots.txt', robots);
router.get('/componentes/:href(*)', obtenerWebCom)
router.get('/:href(*)', arranque);

router.post('/puerto', puerto)



