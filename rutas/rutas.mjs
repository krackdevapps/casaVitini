import express from 'express';
import hub from '../logica/puerto.mjs';
const router = express.Router();
const {
    arranque,
    calendarios_compartidos,
    puerto
} = hub;
router.get('/calendarios_compartidos/:href(*)', calendarios_compartidos)
router.get('/:href(*)', arranque);
router.post('/puerto', puerto)
export default router;
