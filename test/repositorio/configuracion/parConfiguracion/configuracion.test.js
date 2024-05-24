
import { describe, expect, test } from '@jest/globals';

import { obtenerParConfiguracion } from '../../../../logica/repositorio/configuracion/parConfiguracion/obtenerParConfiguracion.mjs';
import { actualizarParConfiguracion } from '../../../../logica/repositorio/configuracion/parconfiguracion/actualizarParConfiguracion.mjs';

describe('handler configruacion', () => {

    const configuracionUID = "zonaHoraria"
    let valorConfiguracion

    test('selec configuracion', async () => {
        const response = await obtenerParConfiguracion([configuracionUID])
        valorConfiguracion = response.zonaHoraria
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })
    test('update configuracion', async () => {
        const response = await actualizarParConfiguracion({
            [configuracionUID]: valorConfiguracion,
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

})
