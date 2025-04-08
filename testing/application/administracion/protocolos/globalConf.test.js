
import { describe, expect, test } from '@jest/globals';
import { actualizarConfiguracion } from '../../../../src/application/administracion/protocolos/alojamiento/configuracion/actualizarConfiguracion.mjs';
import { obtenerConfiguracion } from '../../../../src/application/administracion/protocolos/alojamiento/configuracion/obtenerConfiguracion.mjs';

describe('Global configuration protocolos', () => {


    test('update global protocols configuration', async () => {
        const response = await actualizarConfiguracion({
            body: {
                diasCaducidadRevision: "4",
                diasAntelacionPorReserva: "4"
            },
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('get global configuration', async () => {
        const m = {
            body: {},
        }
        const response = await obtenerConfiguracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

})
