
import { describe, expect, test } from '@jest/globals';
import { insertarConfiguracionApartamento } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/insertarConfiguracionApartamento.mjs';
import { eliminarConfiguracionPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs';
import { eliminarApartamentoComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { insertarApartamentoComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs';
import { eliminarBloqueoPorTestingVI } from '../../../../src/infraestructure/repository/bloqueos/eliminarBloqueoPorTestingVI.mjs';
import { crearNuevoBloqueo } from '../../../../src/application/administracion/bloqueos/crearNuevoBloqueo.mjs';
import { detallesDelBloqueo } from '../../../../src/application/administracion/bloqueos/detallesDelBloqueo.mjs';
import { listaBloquoeosDelApartamento } from '../../../../src/application/administracion/bloqueos/listaBloquoeosDelApartamento.mjs';
import { listarApartamentosConBloqueos } from '../../../../src/application/administracion/bloqueos/listarApartamentosConBloqueos.mjs';
import { modificarBloqueo } from '../../../../src/application/administracion/bloqueos/modificarBloqueo.mjs';
import { eliminarBloqueo } from '../../../../src/application/administracion/bloqueos/eliminarBloqueo.mjs';

describe('crud locks for apartments', () => {
    const apartamentoIDV = "apartamento1testing"
    const tipoPermanente = "permanente"
    const fechaInicio = "2025-10-02"
    const fechaFin = "2026-10-02"
    const testingVI = "bloqueoTest"
    let nuevoBloqueoUID

    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }

    beforeAll(async () => {
        await eliminarBloqueoPorTestingVI(testingVI)
        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDV)
        await eliminarApartamentoComoEntidad(apartamentoIDV)

        await insertarApartamentoComoEntidad({
            apartamentoIDV: apartamentoIDV,
            apartamentoUI: "apartamento como entidad pada test",
        })
        await insertarConfiguracionApartamento({
            apartamentoIDV: apartamentoIDV,
            estadoInicial: "desactivado",
            zonaIDV: "global"
        })
    })

    test('insert new apartmen lock by temporal range with ok', async () => {
        const newLock = {
            body: {
                zonaIDV: "global",
                apartamentoIDV: apartamentoIDV,
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                tipoBloqueoIDV: "rangoTemporal",
                motivo: "Bloqueo creado para testing"
            },
            session: fakeAdminSession
        }
        const response = await crearNuevoBloqueo(newLock)
        nuevoBloqueoUID = response.nuevoBloqueoUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })



    test('insert new apartmen lock by permanent range with ok', async () => {
        const newLock = {
            body: {
                zonaIDV: "global",
                apartamentoIDV: apartamentoIDV,
                tipoBloqueoIDV: tipoPermanente,
                motivo: "Bloqueo creado para testing"
            },
            session: fakeAdminSession
        }
        const response = await crearNuevoBloqueo(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })


    test('get lock by bloqueoUID', async () => {
        const newLock = {
            body: {
                apartamentoIDV: apartamentoIDV,
                bloqueoUID: nuevoBloqueoUID,
            },
            session: fakeAdminSession
        }
        const response = await detallesDelBloqueo(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('get list of locks by apartamentoIDV', async () => {
        const newLock = {
            body: {
                apartamentoIDV: apartamentoIDV,
            },
            session: fakeAdminSession
        }
        const response = await listaBloquoeosDelApartamento(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('get list all locks', async () => {
        const newLock = {
            body: {},
            session: fakeAdminSession
        }
        const response = await listarApartamentosConBloqueos(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('update lock by apartamentoIDV', async () => {
        const newLock = {
            body: {
                bloqueoUID: nuevoBloqueoUID,
                zonaIDV: "global",
                apartamentoIDV: apartamentoIDV,
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                tipoBloqueoIDV: "rangoTemporal",
                motivo: "Bloqueo creado para testing"
            },
            session: fakeAdminSession
        }
        const response = await modificarBloqueo(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('delete lock by bloqueoUID', async () => {
        const newLock = {
            body: {
                bloqueoUID: nuevoBloqueoUID,
            },
            session: fakeAdminSession
        }
        const response = await eliminarBloqueo(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    afterAll(async () => {
        await eliminarBloqueoPorTestingVI(testingVI)
        await eliminarApartamentoComoEntidad(apartamentoIDV)
        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDV)

    });
})
