
import { describe, expect, test } from '@jest/globals';
import { campoDeTransaccion } from '../../../../../logica/repositorio/globales/campoDeTransaccion.mjs';
import { crearEntidadAlojamiento } from '../../../../../logica/zonas/administracion/arquitectura/entidades/crearEntidadAlojamiento.mjs';
import { detallesDeEntidadDeAlojamiento } from '../../../../../logica/zonas/administracion/arquitectura/entidades/detallesDeEntidadDeAlojamiento.mjs';
import { eliminarEntidadAlojamiento } from '../../../../../logica/zonas/administracion/arquitectura/entidades/eliminarEntidadAlojamiento.mjs';
import { modificarEntidadAlojamiento } from '../../../../../logica/zonas/administracion/arquitectura/entidades/modificarEntidadAlojamiento.mjs';

describe('crudEntitiys', () => {
    const apartamentoUI = "Apartamento para testing"
    const apartamentoIDV = "apartamentoparatesting"

    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    beforeAll(async () => {
        await campoDeTransaccion("iniciar")
    })
    test('createEntity ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "apartamento",
                apartamentoUI: apartamentoUI,
                apartamentoIDV: apartamentoIDV
            },
            session: fakeAdminSession
        }
        const response = await crearEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('createEntity error by idv string', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "apartamento",
                    apartamentoUI: "apartamentoUI_2",
                    apartamentoIDV: "apartamento IDV"
                },
                session: fakeAdminSession
            }
            const response = await crearEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
            expect(error.message).toBe('El apartamentoIDV solo acepta una cadena de mayúsculas, minúsculas y números.');
        }
    })


    test('createEntity error by ui string', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "apartamento",
                    apartamentoUI: "apartamentoUI_2''''",
                    apartamentoIDV: "apartamento_3"
                },
                session: fakeAdminSession
            }
            const response = await crearEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
            expect(error.message).toBe('El campo del apartamentoUI solo acepta una cadena de mayúsculas, minúsculas, números, vocales acentuadas, espacios y los siguientes caracteres: _, -, . y /');
        }
    })

    test('createEntity unknown type of entity', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "apartamento1",
                    apartamentoUI: "apartamentoUI_2''''",
                    apartamentoIDV: "apartamento_3"
                },
                session: fakeAdminSession
            }
            const response = await crearEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
            expect(error.message).toBe('No se reconoce el tipo de entidad');
        }
    })

    test('createEntity bed error in camaUI', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "cama",
                    camaUI: "apartamentoUI_2''''",
                    camaIDV: "apartamento_3"
                },
                session: fakeAdminSession
            }
            const response = await crearEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
            expect(error.message).toBe('El campo del camaUI solo acepta una cadena de mayúsculas, minúsculas, números, vocales acentuadas, espacios y los siguientes caracteres: _, -, . y /');
        }
    })


    test('createEntity bed ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "cama",
                camaUI: "Nueva cama para testing",
                camaIDV: "camatesting",
                capacidad: "3",
                tipoCama: "compartida"
            },
            session: fakeAdminSession
        }
        const response = await crearEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('createEntity room ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "habitacion",
                habitacionUI: "Nueva habitacion para testing",
                habitacionIDV: "habitaciontesting"
            },
            session: fakeAdminSession
        }
        const response = await crearEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('details Entity room ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "habitacion",
                entidadIDV: "habitaciontesting"
            },
            session: fakeAdminSession
        }
        const response = await detallesDeEntidadDeAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    test('details Entity bed ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "cama",
                entidadIDV: "camatesting"
            },
            session: fakeAdminSession
        }
        const response = await detallesDeEntidadDeAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    test('details Entity room ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "habitacion",
                entidadIDV: "habitaciontesting"
            },
            session: fakeAdminSession
        }
        const response = await detallesDeEntidadDeAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('error in tipoEntidad', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "habitacion1",
                    entidadIDV: "habitaciontesting"
                },
                session: fakeAdminSession
            }
            const response = await crearEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
            expect(error.message).toBe('No se reconoce el tipo de entidad');
        }
    })


    test('error by type unexpected in entidadIDV', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "habitacion1",
                    entidadIDV: 5
                },
                session: fakeAdminSession
            }
            const response = await crearEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })

    test('error by type unexpected in entidadIDV', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "habitacion1",
                    // entidadIDV: 5
                },
                session: fakeAdminSession
            }
            const response = await crearEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })


    test('error by type unexpected in entidadIDV', async () => {
        try {
            const makeEntity = {
                body: {
                    // tipoEntidad: "habitacion1",
                    entidadIDV: 5
                },
                session: fakeAdminSession
            }
            const response = await crearEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })
    test('update entity apartamento with ok', async () => {

        const makeEntity = {
            body: {
                tipoEntidad: "apartamento",
                entidadIDV: "apartamentoparatesting",
                apartamentoIDV: "apartamentoparatesting",
                apartamentoUI: "apartamentoparatesting",
                caracteristicas: [
                    "test"
                ]
            },
            session: fakeAdminSession
        }
        const response = await modificarEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
    })

    test('update entity apartamento with error', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "apartamento''",
                    entidadIDV: 2
                },
                session: fakeAdminSession
            }
            const response = await modificarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })


    test('update entity room with ok', async () => {

        const makeEntity = {
            body: {
                tipoEntidad: "habitacion",
                entidadIDV: "habitaciontesting",
                habitacionIDV: "habitaciontesting",
                habitacionUI: "habitacion para testing"
            },
            session: fakeAdminSession
        }
        const response = await modificarEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
    })

    test('update entity room with error', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "habitacion1",
                    entidadIDV: "habitaciontesting",
                    habitacionIDV: "habitaciontesting",
                    habitacionUI: "habitacion para testing"
                },
                session: fakeAdminSession
            }
            const response = await modificarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })



    test('update entity room with error', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "habitacion",
                    entidadIDV: "habitaciont'esting",
                    habitacionIDV: "habitaciontesting",
                    habitacionUI: "habitacion para testing"
                },
                session: fakeAdminSession
            }
            const response = await modificarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })




    test('update entity room with error', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "habitacion",
                    entidadIDV: "habitaciontesting",
                    habitacionIDV: "habitaci'ontesting",
                    habitacionUI: "habitacion para testing"
                },
                session: fakeAdminSession
            }
            const response = await modificarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })


    test('update entity room with error', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "habitacion",
                    entidadIDV: "habitaciontesting",
                    habitacionIDV: "habitaciontesting",
                    habitacionUI: 9
                },
                session: fakeAdminSession
            }
            const response = await modificarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })

    test('delete room', async () => {

        const makeEntity = {
            body: {
                tipoEntidad: "habitacion",
                entidadIDV: "habitaciontesting"
            },
            session: fakeAdminSession
        }
        const response = await eliminarEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    test('delete bed', async () => {

        const makeEntity = {
            body: {
                tipoEntidad: "cama",
                entidadIDV: "camatesting",
                tipoIDV: "compartida"
            },
            session: fakeAdminSession
        }
        const response = await eliminarEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    test('delete apartament', async () => {

        const makeEntity = {
            body: {
                tipoEntidad: "apartamento",
                entidadIDV: "apartamentoparatesting",

            },
            session: fakeAdminSession
        }
        const response = await eliminarEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('error on tipoEntidad', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "apartamento1",
                    entidadIDV: "apartamentoparatesting"
                },
                session: fakeAdminSession
            }
            const response = await eliminarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })
    test('error on tipoEntidad', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "apartamento1",
                    entidadIDV: "apartamentoparatesting22"
                },
                session: fakeAdminSession
            }
            const response = await eliminarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })

    test('error on tipoEntidad', async () => {
        try {
            const makeEntity = {
                body: {
                    //  tipoEntidad: "apartamento1",
                    entidadIDV: "apartamentoparatesting22"
                },
                session: fakeAdminSession
            }
            const response = await eliminarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })

    test('error on tipoEntidad', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "apartamento1",
                    //  entidadIDV: "apartamentoparatesting22"
                },
                session: fakeAdminSession
            }
            const response = await eliminarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })


    test('error on tipoEntidad', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: 2,
                    //  entidadIDV: "apartamentoparatesting22"
                },
                session: fakeAdminSession
            }
            const response = await eliminarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })

    test('error on tipoEntidad', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "apartamento",
                    entidadIDV: 2
                },
                session: fakeAdminSession
            }
            const response = await eliminarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })


    test('error on tipoEntidad', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "apartamento''",
                    entidadIDV: 2
                },
                session: fakeAdminSession
            }
            const response = await eliminarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })


    afterAll(async () => {
        await campoDeTransaccion("cancelar")
    })
})
