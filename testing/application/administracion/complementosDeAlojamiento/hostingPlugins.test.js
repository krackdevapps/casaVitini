
import { describe, expect, test } from '@jest/globals';
import { crearComplementoDeAlojamiento } from '../../../../src/application/administracion/complementosDeAlojamiento/crearComplementoDeAlojamiento.mjs';
import { eliminarUsuarioPorTestingVI } from '../../../../src/infraestructure/repository/usuarios/eliminarUsuarioPorTestingVI.mjs';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { actualizarEstado } from '../../../../src/application/administracion/complementosDeAlojamiento/actualizarEstado.mjs';
import { actualizarComplemento } from '../../../../src/application/administracion/complementosDeAlojamiento/actualizarComplemento.mjs';
import { detallesComplemento } from '../../../../src/application/administracion/complementosDeAlojamiento/detallesComplemento.mjs';
import { obtenerComplementosPorAlojamiento } from '../../../../src/application/administracion/complementosDeAlojamiento/obtenerComplementosPorAlojamiento.mjs';
import { eliminarComplemento } from '../../../../src/application/administracion/complementosDeAlojamiento/eliminarComplemento.mjs';

describe('hosting plugins system', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const testingVI = "testing"
    const apartamentoIDV = "apartmenttestingholdinreserve"
    const apartamentoUI = "Apartamento temporal creado testing holder"
    const habitacionIDV = "roomtestingholdinreserve"
    const habitacionUI = "Habitacion temporal para testing holder"
    const camaIDV = "bedtestingholder"
    const camaUI = "Cama temporal para testing holder"
    let complementoUID
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarUsuarioPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        await eliminarReservaPorTestingVI(testingVI)

        await makeHostArquitecture({
            operacion: "construir",
            apartamentoIDV: apartamentoIDV,
            apartamentoUI: apartamentoUI,
            habitacionIDV: habitacionIDV,
            habitacionUI: habitacionUI,
            camaIDV: camaIDV,
            camaUI: camaUI,
        })

    })

    test('create hosting plugin with ok', async () => {
        const response = await crearComplementoDeAlojamiento({
            body: {
                apartamentoIDV: apartamentoIDV,
                complementoUI: "Complemento temporal",
                definicion: "Complemento temporal de alojamiento para testing",
                tipoPrecio: "porNoche",
                precio: "100.00",
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        complementoUID = response.nuevoComplementoUID
    })



    test('update hosting plugin with ok', async () => {
        const m = {
            body: {
                complementoUID: String(complementoUID),
                apartamentoIDV: apartamentoIDV,
                complementoUI: "Complemento temporal actualizado",
                definicion: "Complemento temporal de alojamiento para testing",
                tipoPrecio: "porNoche",
                precio: "100.00",
            },
            session: fakeAdminSession
        }
        const response = await actualizarComplemento(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update status of hosting plugin with ok', async () => {
        const m = {
            body: {
                complementoUID: String(complementoUID),
                estadoIDV: "activado"
            },
            session: fakeAdminSession
        }
        const response = await actualizarEstado(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get details of hosting plugin with ok', async () => {
        const m = {
            body: {
                complementoUID: String(complementoUID)
            },
            session: fakeAdminSession
        }
        const response = await detallesComplemento(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get all hostin plugin by apartamentoIDV  with ok', async () => {

        const response = await obtenerComplementosPorAlojamiento({
            body: {
                apartamentoIDV: apartamentoIDV,
                filtro: "todos"
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('delete hostin plugin with ok', async () => {

        const response = await eliminarComplemento({
            body: {
                complementoUID: String(complementoUID)
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarUsuarioPorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
