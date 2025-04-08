
import { describe, expect, test } from '@jest/globals';
import { resolverQR } from '../../../src/application/miCasa/componentes/resolverQR.mjs';
import { eliminarReservaPorTestingVI } from '../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { makeHostArquitecture } from '../../sharedUsesCases/makeHostArquitecture.mjs';
import { crearReservaSimpleAdministrativa } from '../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { eliminarUsuarioPorTestingVI } from '../../../src/infraestructure/repository/usuarios/eliminarUsuarioPorTestingVI.mjs';
import { crearCuentaDesdeAdministracion } from '../../../src/application/administracion/usuarios/crearCuentaDesdeAdministracion.mjs';
import { actualizarDatosUsuarioDesdeAdministracion } from '../../../src/application/administracion/usuarios/actualizarDatosUsuarioDesdeAdministracion.mjs';
import { obtenerUsuario } from '../../../src/infraestructure/repository/usuarios/obtenerUsuario.mjs';
import { actualizarEstadoVerificacion } from '../../../src/infraestructure/repository/usuarios/actualizarEstadoVerificacion.mjs';
import { crearTitular } from '../../../src/application/administracion/reservas/detallesReserva/gestionTitular/crearTitular.mjs';
import { eliminarClientePorTestingVI } from '../../../src/infraestructure/repository/clientes/eliminarClientePorTestingVI.mjs';

describe('qr resolver', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let reservaUID
    const testingVI = "testingtaxesinbookin"
    const apartamentoIDV = "apartmenttestingholdinreserve"
    const apartamentoUI = "Apartamento temporal creado testing holder"
    const habitacionIDV = "roomtestingholdinreserve"
    const habitacionUI = "Habitacion temporal para testing holder"
    const camaIDV = "bedtestingholder"
    const camaUI = "Cama temporal para testing holder"

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarClientePorTestingVI(testingVI)
        await eliminarUsuarioPorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
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

        const reserva = await crearReservaSimpleAdministrativa({
            body: {
                fechaEntrada: "2026-10-10",
                fechaSalida: "2026-10-20",
                apartamentos: [apartamentoIDV],
                estadoInicialIDV: "confirmada",
                estadoInicialOfertasIDV: "noAplicarOfertas"

            },
            session: fakeAdminSession
        })
        reservaUID = reserva.reservaUID
    })


    test('create user from administration for operations', async () => {
        const response = await crearCuentaDesdeAdministracion({
            body: {
                usuarioIDX: fakeAdminSession.usuario,
                clave: "1234567890A!",
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update data of user from administration', async () => {
        const m = {
            body: {
                usuarioIDX: fakeAdminSession.usuario,
                nombre: "fakename",
                primerApellido: "lastname",
                segundoApellido: "seconlastname",
                pasaporte: "pasaportetestingmanaginusers",
                mail: "fake@fake.com",
                telefono: "43534534345"
            },
            session: fakeAdminSession
        }
        const response = await actualizarDatosUsuarioDesdeAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    const holder = {
        nombre: "fakeholder",
        primerApellido: "holderlastname",
        segundoApellido: "holderlastname",
        pasaporte: "holderpassport",
        telefono: "23423234",
        correoElectronico: "fake@fake.com",
        notas: "",
    }
    test('create holder for booking booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                ...holder
            },
            session: fakeAdminSession
        }
        const response = await crearTitular(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('verify user account', async () => {

        const usuario = await obtenerUsuario({
            usuario: fakeAdminSession.usuario,
            errorSi: "noExiste"
        })
        const codigoVerificacion = usuario.codigoVerificacion

        const response = await actualizarEstadoVerificacion({
            estadoVerificado: "si",
            codigo: codigoVerificacion
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('usuario');
    })


    test('get booking by qr decoded', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                codigoIDV: "reserva"
            },
            session: fakeAdminSession
        }
        const response = await resolverQR(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarClientePorTestingVI(testingVI)
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
