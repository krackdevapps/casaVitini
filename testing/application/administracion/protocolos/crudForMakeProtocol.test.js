
import { afterAll, describe, expect, test } from '@jest/globals';
import { crearNuevoElemento } from '../../../../src/application/administracion/inventario/crearNuevoElemento.mjs';
import { eliminarElementoPorTestingVI } from '../../../../src/infraestructure/repository/inventario/eliminarElementoPorTestingVI.mjs';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { insertarInventarioEnProtocolo } from '../../../../src/application/administracion/protocolos/alojamiento/gestion_de_protocolos/inventario/insertarInventarioEnProtocolo.mjs';
import { actualizarPosicionElementoInventario } from '../../../../src/application/administracion/protocolos/alojamiento/gestion_de_protocolos/inventario/actualizarPosicionElementoInventario.mjs';
import { actualizarCantidadElementoInventario } from '../../../../src/application/administracion/protocolos/alojamiento/gestion_de_protocolos/inventario/actualizarCantidadElementoInventario.mjs';
import { eliminarElementoInventarioDelProtocolo } from '../../../../src/application/administracion/protocolos/alojamiento/gestion_de_protocolos/inventario/eliminarElementoInventarioDelProtocolo.mjs';
import { insertarTareaEnProtocolo } from '../../../../src/application/administracion/protocolos/alojamiento/gestion_de_protocolos/tareas/insertarTareaEnProtocolo.mjs';
import { actualizarPosicionTarea } from '../../../../src/application/administracion/protocolos/alojamiento/gestion_de_protocolos/tareas/actualizarPosicionTarea.mjs';
import { actualizarTareaEnProtocolo } from '../../../../src/application/administracion/protocolos/alojamiento/gestion_de_protocolos/tareas/actualizarTareaEnProtocolo.mjs';
import { eliminarTareaDelProtocolo } from '../../../../src/application/administracion/protocolos/alojamiento/gestion_de_protocolos/tareas/eliminarTareaDelProtocolo.mjs';
import { obtenerProtocoloDelAlojamiento } from '../../../../src/application/administracion/protocolos/alojamiento/gestion_de_protocolos/obtenerProtocoloDelAlojamiento.mjs';
import { obtenerRevision } from '../../../../src/application/administracion/protocolos/alojamiento/revisar_alojamiento/obtenerRevision.mjs';
import { eliminarUsuarioPorTestingVI } from '../../../../src/infraestructure/repository/usuarios/eliminarUsuarioPorTestingVI.mjs';
import { crearCuentaDesdeAdministracion } from '../../../../src/application/administracion/usuarios/crearCuentaDesdeAdministracion.mjs';
import { actualizarRevisionInventario } from '../../../../src/application/administracion/protocolos/alojamiento/revisar_alojamiento/actualizarRevisionInventario.mjs';
import { actualizarReposicionInventario } from '../../../../src/application/administracion/protocolos/alojamiento/revisar_alojamiento/actualizarReposicionInventario.mjs';
import { obtenerTareasDelAlojamiento } from '../../../../src/application/administracion/protocolos/alojamiento/revisar_alojamiento/obtenerTareasDelAlojamiento.mjs';
import { actualizarTareasRealizadasAlojamientoFinalizaRevision } from '../../../../src/application/administracion/protocolos/alojamiento/revisar_alojamiento/actualizarTareasRealizadasAlojamientoFinalizaRevision.mjs';
import { obtenerReposicion } from '../../../../src/application/administracion/protocolos/alojamiento/revisar_alojamiento/obtenerReposicion.mjs';
import { cancelarRevision } from '../../../../src/application/administracion/protocolos/alojamiento/revisar_alojamiento/cancelarRevision.mjs';
import { actualizarFechaPosPuesta } from '../../../../src/application/administracion/protocolos/alojamiento/estado_de_alojamiento/actualizarFechaPosPuesta.mjs';
import { DateTime } from 'luxon';
import { codigoZonaHoraria } from '../../../../src/shared/configuracion/codigoZonaHoraria.mjs';
import { eliminarFechaPosPuesta } from '../../../../src/application/administracion/protocolos/alojamiento/estado_de_alojamiento/eliminarFechaPosPuesta.mjs';
import { obtenerEstadosDeTodosLosAlojamiento } from '../../../../src/application/administracion/protocolos/alojamiento/estado_de_alojamiento/obtenerEstadosDeTodosLosAlojamiento.mjs';
import { obtenerDetallesRevision } from '../../../../src/application/administracion/protocolos/alojamiento/registro_de_revisiones/obtenerDetallesRevision.mjs';
import { eliminarRevision } from '../../../../src/application/administracion/protocolos/alojamiento/registro_de_revisiones/eliminarRevision.mjs';
import { buscadorRegistroRevisiones } from '../../../../src/application/administracion/protocolos/alojamiento/registro_de_revisiones/buscadorRegistroRevisiones.mjs';
import { obtenerCincoUltimasRevisionesPorUsuario } from '../../../../src/application/administracion/protocolos/alojamiento/revisionesPorUsuario/obtenerCincoUltimasRevisionesPorUsuario.mjs';
import { obtenerUsuariosConRevisiones } from '../../../../src/application/administracion/protocolos/alojamiento/revisionesPorUsuario/obtenerUsuariosConRevisiones.mjs';

describe('crud for make protocol', () => {
    const testingVI = "testingmakeprotocols"
    const apartamentoIDV = "TestingAlojamiento"
    const habitacionIDV = "testingalojamiento"
    const camaIDV = "camatesting"
    const apartamentoUI = "testing"
    const habitacionUI = "testing"
    const camaUI = "testing"

    let elementoUID
    let elementoUID_enInventario
    let elementoUID_enInventario_segundo

    let tareaUID
    let tareaUID_segunda

    let revision
    let revision_segunda
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarUsuarioPorTestingVI(testingVI)
        await eliminarElementoPorTestingVI(testingVI)
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
    })

    test('Create new elemento in inventory', async () => {

        const response = await crearNuevoElemento({
            body: {
                nombre: "Elemento para testing",
                cantidad: "10",
                tipoLimite: "sinLimite",
                cantidadMinima: "0",
                descripcion: "testing",
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        elementoUID = response.elementoUID
    })

    test('insert inventory in hosting protocol', async () => {

        const response = await insertarInventarioEnProtocolo({
            body: {
                elementoUID: elementoUID,
                apartamentoIDV: apartamentoIDV,
                cantidad_enAlojamiento: "1",
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        elementoUID_enInventario = response.elementoUID_enInventario
    })

    test('insert second inventory in hosting protocol', async () => {

        const response = await insertarInventarioEnProtocolo({
            body: {
                elementoUID: elementoUID,
                apartamentoIDV: apartamentoIDV,
                cantidad_enAlojamiento: "1",
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        elementoUID_enInventario_segundo = response.elementoUID_enInventario

    })

    test('update position of inventory in hosting protocol', async () => {

        const response = await actualizarPosicionElementoInventario({
            body: {
                uid: elementoUID_enInventario,
                posicion: "2",
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update quantity of inventory in hosting protocol', async () => {

        const response = await actualizarCantidadElementoInventario({
            body: {
                uid: elementoUID_enInventario,
                cantidad_enAlojamiento: "2",
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete second inventory in hosting protocol', async () => {
        const response = await eliminarElementoInventarioDelProtocolo({
            body: {
                uid: elementoUID_enInventario_segundo
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        elementoUID_enInventario_segundo = response.elementoUID_enInventario

    })

    test('insert task in hosting protocol', async () => {
        const response = await insertarTareaEnProtocolo({
            body: {
                apartamentoIDV,
                tipoDiasIDV: ["siempre"],
                tareaUI: "Tarea test"
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

        tareaUID = response.tarea


    })

    test('insert second task in hosting protocol', async () => {

        const response = await insertarTareaEnProtocolo({
            body: {
                apartamentoIDV,
                tipoDiasIDV: ["siempre"],
                tareaUI: "Tarea test segunda"
            }
        })

        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

        tareaUID_segunda = response.tarea


    })

    test('update position task in hosting protocol', async () => {
        const response = await actualizarPosicionTarea({
            body: {
                uid: tareaUID,
                posicion: "2"
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('update task in hosting protocol', async () => {
        const response = await actualizarTareaEnProtocolo({
            body: {
                uid: tareaUID,
                tipoDiasIDV: ["siempre"],
                tareaUI: "Tarea test"
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete second task in hosting protocol', async () => {

        const response = await eliminarTareaDelProtocolo({
            body: {
                uid: tareaUID_segunda
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get hosting protocol', async () => {
        const response = await obtenerProtocoloDelAlojamiento({
            body: {
                apartamentoIDV,

            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    const usuarioFake = "testinprotocols"

    test('create user from administration', async () => {
        const response = await crearCuentaDesdeAdministracion({
            body: {
                usuarioIDX: usuarioFake,
                clave: "1234567890A!"
            },
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('start revision of hosting protocol', async () => {
        const response = await obtenerRevision({
            body: {
                apartamentoIDV,
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        revision = response
    })
    test('get position of hosting protocol', async () => {

        const response = await obtenerReposicion({
            body: {
                uid: revision.revision.uid
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update revision of inventory hosting protocol', async () => {

        const respuestas = [
            {
                uid: elementoUID_enInventario,
                cantidadEncontrada: "1",
                color: "rojo"
            }
        ]

        const response = await actualizarRevisionInventario({
            body: {
                uid: revision.revision.uid,
                respuestas
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update reposition of inventory hosting protocol', async () => {
        const respuestas = [
            {
                uid: elementoUID_enInventario,
                cantidadEncontrada: "1",
                color: "verde"
            }
        ]

        const response = await actualizarReposicionInventario({
            body: {
                uid: revision.revision.uid,
                respuestas
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('gest task of hosting protocol', async () => {
        const response = await obtenerTareasDelAlojamiento({
            body: {
                apartamentoIDV
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update completed tasks of hosting protocol', async () => {

        const response = await actualizarTareasRealizadasAlojamientoFinalizaRevision({
            body: {
                uid: revision.revision.uid,
                respuestas: [
                    {
                        uid: tareaUID,
                        color: "verde",
                        explicacion: ""
                    }
                ]
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('Postpone review date of hosting protocol', async () => {
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaPosPuesta = DateTime.now().setZone(zonaHoraria).plus({ day: 10 }).toISODate()

        const response = await actualizarFechaPosPuesta({
            body: {
                apartamentoIDV,
                fechaPosPuesta
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('deleted postponed review date of hosting protocol', async () => {
        const response = await eliminarFechaPosPuesta({
            body: {
                apartamentoIDV
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    test('start revision of hosting protocol', async () => {
        const response = await obtenerRevision({
            body: {
                apartamentoIDV,
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        revision_segunda = response
    })

    test('cancel revision of hosting protocol', async () => {
        const response = await cancelarRevision({
            body: {
                uid: revision_segunda.revision.uid,
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('get status of all hostings', async () => {
        const response = await obtenerEstadosDeTodosLosAlojamiento()
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get details of revision of hosting protocol', async () => {
        const response = await obtenerDetallesRevision({
            body: {
                revisionUID: revision.revision.uid,
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('delete of revision of hosting protocol', async () => {
        const response = await eliminarRevision({
            body: {
                revisionUID: revision.revision.uid,
            },
            session: {
                usuario: usuarioFake
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('search all revision of hosting protocol', async () => {
        const response = await buscadorRegistroRevisiones({
            body: {
                buscar: ""
            },

        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get 5 last revision of hosting protocol by user', async () => {
        const response = await obtenerCincoUltimasRevisionesPorUsuario({
            body: {
                usuario: usuarioFake,
            },
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get all revisions of hosting protocol by user', async () => {
        const response = await obtenerUsuariosConRevisiones()
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    afterAll(async () => {
        await eliminarUsuarioPorTestingVI(testingVI)
        await eliminarElementoPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
