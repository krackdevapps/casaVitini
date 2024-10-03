
import { describe, expect, test, jest } from '@jest/globals';
import { eliminarUsuarioPorTestingVI } from '../../../src/infraestructure/repository/usuarios/eliminarUsuarioPorTestingVI.mjs';
import { eliminarReservaPorTestingVI } from '../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { makeHostArquitecture } from '../../sharedUsesCases/makeHostArquitecture.mjs';
import { crearReservaSimpleAdministrativa } from '../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { detallesReserva } from '../../../src/application/miCasa/misReservas/detallesReserva.mjs';
import { crearCuentaDesdeAdministracion } from '../../../src/application/administracion/usuarios/crearCuentaDesdeAdministracion.mjs';
import { actualizarDatosUsuarioDesdeAdministracion } from '../../../src/application/administracion/usuarios/actualizarDatosUsuarioDesdeAdministracion.mjs';
import { crearCliente } from '../../../src/application/administracion/clientes/crearCliente.mjs';
import { asociarTitular } from '../../../src/application/administracion/reservas/detallesReserva/gestionTitular/asociarTitular.mjs';
import { eliminarClientePorTestingVI } from '../../../src/infraestructure/repository/clientes/eliminarClientePorTestingVI.mjs';
import { obtenerUsuario } from '../../../src/infraestructure/repository/usuarios/obtenerUsuario.mjs';
import { verificarCuenta } from '../../../src/application/miCasa/verificarCuenta.mjs';
import { listarMisReservas } from '../../../src/application/miCasa/misReservas/listarMisReservas.mjs';
import { obtenerPDF } from '../../../src/application/miCasa/misReservas/obtenerPDF.mjs';

describe('miCasa bookins', () => {
    const testingVI = "testingbmicasa"
    const usuarioIDV_inicial = "userfortestingfo"
    const clave_inicial = "123456789A!"
    const fakeAdminSession = {
        usuario: usuarioIDV_inicial,
        rolIDV: "administrador",
    }

    let reservaUID
    let clienteUID
    const apartamentoIDV = "apartmenttestingholdinreserve"
    const apartamentoUI = "Apartamento temporal creado testing holder"
    const habitacionIDV = "roomtestingholdinreserve"
    const habitacionUI = "Habitacion temporal para testing holder"
    const camaIDV = "bedtestingholder"
    const camaUI = "Cama temporal para testing holder"

    const usuario_cliente = "testinguserb"
    const fakeClientSession = {
        usuario: usuario_cliente,
        rolIDV: "cliente",
    }
    const fakeMail = "fake@mail.com"
    const fakeClient = {
        nombre: "fakeName",
        primerApellido: "fakeLastName",
        segundoApellido: "fakeLastSeconName",
        pasaporte: "passportFake",
        telefono: "122333411",
        correoElectronico: fakeMail,
        notas: "fakeNoteText",
    }
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
    test('create user from administration with ok', async () => {
        const m = {
            body: {
                usuarioIDX: usuario_cliente,
                clave: clave_inicial,
                rolIDV: "cliente"
            },
            session: fakeAdminSession,

        }
        const response = await crearCuentaDesdeAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update data of user from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: usuario_cliente,
                nombre: "fakename",
                primerApellido: "lastname",
                segundoApellido: "seconlastname",
                pasaporte: "pasaportetestingmanaginusers",
                mail: fakeMail,
                telefono: "43534534345"
            },
            session: fakeAdminSession
        }
        const response = await actualizarDatosUsuarioDesdeAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('create new client with ok', async () => {
        const newClient = {
            body: {
                ...fakeClient
            },
            session: fakeAdminSession
        }
        const response = await crearCliente(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        clienteUID = response.nuevoUIDCliente
    })

    test('associate new client as holder in booking with ok', async () => {
        const newClient = {
            body: {
                reservaUID: String(reservaUID),
                clienteUID
            },
            session: fakeAdminSession
        }
        const response = await asociarTitular(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        clienteUID = response.nuevoUIDCliente
    })

    test('verifiy IDX of user account', async () => {


        const usuarioDetalles = await obtenerUsuario({
            usuario: usuario_cliente,
            errorSi: "noExiste"
        })
        const codigoVerificacion = usuarioDetalles.codigoVerificacion


        const m = {
            body: {
                codigo: codigoVerificacion
            },
            session: fakeAdminSession
        }
        const response = await verificarCuenta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('details of reserve of user with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID)
            },
            session: fakeClientSession,

        }
        const response = await detallesReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('lists of bookins of user with ok', async () => {
        const m = {
            body: {
                pagina: 1
            },
            session: fakeClientSession,

        }
        const response = await listarMisReservas(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get pdf of bookin of user with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID)
            },
            session: fakeClientSession,

        }
        const response = await obtenerPDF(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get details of bookin of user with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID)
            },
            session: fakeClientSession,

        }
        const response = await detallesReserva(m)
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
