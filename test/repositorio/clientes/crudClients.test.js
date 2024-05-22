
import { describe, expect, test } from '@jest/globals';
import { actualizarCliente } from '../../../logica/repositorio/clientes/actualizarCliente.mjs';
import { eliminarClientePorClienteIDV } from '../../../logica/repositorio/clientes/eliminarClientePorClienteIDV.mjs';
import { obtenerClientesPorMail } from '../../../logica/repositorio/clientes/obtenerClientesPorMail.mjs';
import { obtenerClientesPorPasaporte } from '../../../logica/repositorio/clientes/obtenerClientesPorPasaporte.mjs';
import { obtenerReservasDelCliente } from '../../../logica/repositorio/clientes/obtenerReservasDelCliente.mjs';
import { obtenerReservasDelClienteComoPernoctante } from '../../../logica/repositorio/clientes/obtenerReservasDelClienteComoPernoctante.mjs';
import { obtenerReservasDelClienteComoTitular } from '../../../logica/repositorio/clientes/obtenerReservasDelClienteComoTitular.mjs';
import { insertarCliente } from '../../../logica/repositorio/clientes/insertarCliente.mjs';
import { obtenerResultadosBusqueda } from '../../../logica/repositorio/clientes/obtenerResultadosBusqueda.mjs';

describe('crud clients', () => {
    const clineteTVI = "clienteTest"
    const calendarioIDV = "calendarioParaTest"
    const bloqueoIDV = "bloqueoTest"
    const nombreCliente = "clienteTest"
    const primerApellido = "apellidoTest"
    const segundoApellido = "apellidoTest"
    const pasaporte = "pasaporteTest"
    const telefono = "123456789"
    const correoElectronico = "test@test.com"
    const notas = "Cliente creado para testing"

    let nuevoClienteUID = 0

    beforeAll(async () => {
        await eliminarClientePorClienteIDV(clineteTVI)
    })
    test('insert new client', async () => {
        const response = await insertarCliente({
            nombre: nombreCliente,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            pasaporte: pasaporte,
            telefono: telefono,
            correoElectronico: correoElectronico,
            notas: notas,
        })
        nuevoClienteUID = response.clienteUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })
    test('update client', async () => {
        const response = await actualizarCliente({
            clienteUID: nuevoClienteUID,
            nombre: nombreCliente,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            pasaporte: pasaporte,
            telefono: telefono,
            correoElectronico: correoElectronico,
            notas: notas,
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test('selec client by mail', async () => {
        const response = await obtenerClientesPorMail(correoElectronico);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })
    test('selec client by pasaporte', async () => {
        const response = await obtenerClientesPorPasaporte(pasaporte);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('selec reseervas by clienteUID for search', async () => {
        const response = await obtenerReservasDelCliente({
            UIDSreservasComoTitular: [1, 2, 3],
            UIDSreservasComoPernoctante: [1, 2, 3],
            UIDSreservasComoAmbos: [1, 2, 3],
            numeroPorPagina: 10,
            sentidoColumna: "ascendente",
            numeroPagina: 1,
            nombreColumna: "fechaEntrada",
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('selec reserva of client as perocntante by clienteUID', async () => {
        const response = await obtenerReservasDelClienteComoPernoctante(nuevoClienteUID);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('selec reserva of client titularUID', async () => {
        const response = await obtenerReservasDelClienteComoTitular(0);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })


    test('selec cliente by search', async () => {
        const response = await obtenerResultadosBusqueda({
            numeroPagina: 1,
            numeroPorPagina: "10",
            nombreColumna: "nombre",
            terminoBusqueda: "test",
            sentidoColumna: "ascendente",
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    afterAll(async () => {
        await eliminarClientePorClienteIDV(clineteTVI)
    });
})
