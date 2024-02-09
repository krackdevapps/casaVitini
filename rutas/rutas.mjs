import express from 'express';
import hub from '../logica/hub.mjs';

const router = express.Router();
const {
    arranque,
    puertoGet,
    puerto
} = hub;
router.get('/puerto/:href(*)', puertoGet)
router.get('/:href(*)', arranque);
router.post('/puerto', puerto)

export default router;

