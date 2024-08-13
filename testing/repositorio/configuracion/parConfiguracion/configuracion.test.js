
import { describe, expect, test } from '@jest/globals';

import { obtenerParConfiguracion } from '../../../../logica/repositorio/configuracion/parConfiguracion/obtenerParConfiguracion.mjs';
import { actualizarParConfiguracion } from '../../../../logica/repositorio/configuracion/parConfiguracion/actualizarParConfiguracion.mjs';

describe('handler configruacion', () => {

    const arrayDeConfiguracionesUID = ["zonaHoraria"]
    let valorConfiguracion

    test('selec configuracion', async () => {
        const response = await obtenerParConfiguracion(arrayDeConfiguracionesUID)
        valorConfiguracion = response.zonaHoraria
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })
    test('update configuracion', async () => {
        const response = await actualizarParConfiguracion({
            diasAntelacionReserva: "10",
            diasMaximosReserva: "10",
            limiteFuturoReserva: "350",

        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

})
