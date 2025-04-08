
import { describe, expect, test } from '@jest/globals';
import { crearEntidadAlojamiento } from '../../../../../src/application/administracion/arquitectura/entidades/crearEntidadAlojamiento.mjs';
import { detallesDeEntidadDeAlojamiento } from '../../../../../src/application/administracion/arquitectura/entidades/detallesDeEntidadDeAlojamiento.mjs';
import { eliminarEntidadAlojamiento } from '../../../../../src/application/administracion/arquitectura/entidades/eliminarEntidadAlojamiento.mjs';
import { modificarEntidadAlojamiento } from '../../../../../src/application/administracion/arquitectura/entidades/modificarEntidadAlojamiento.mjs';
import { eliminarApartamentoComoEntidad } from '../../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { eliminarCamaComoEntidad } from '../../../../../src/infraestructure/repository/arquitectura/entidades/cama/eliminarCamaComoEntidad.mjs';
import { eliminarHabitacionComoEntidad } from '../../../../../src/infraestructure/repository/arquitectura/entidades/habitacion/eliminarHabitacionComoEntidad.mjs';

describe('crudEntitiys', () => {
    const apartamentoUI = "Apartamento para testing de entidades"
    const apartamentoIDV = "apartamentoparatestingentitys"
    const camaIDV = "bedfortestingcrudentitys"
    const habitacionIDV = "roomfortestingcrudentitys"
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    beforeAll(async () => {
        await eliminarApartamentoComoEntidad(apartamentoIDV)
        await eliminarCamaComoEntidad(camaIDV)
        await eliminarHabitacionComoEntidad(habitacionIDV)
    })

    test('createEntity ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "apartamento",
                apartamentoUI: apartamentoUI,
                apartamentoIDV: apartamentoIDV,
                apartamentoUIPublico: "Apartamento para testing",
                definicionPublica: "Apartamento creado para testing"
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

            expect(error).toBeInstanceOf(Error);

            expect(error.message).toBe('El apartamentoIDV solo acepta una cadena de mayúsculas, minúsculas, números y no se permite Ñ ni Ç.');
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

            expect(error).toBeInstanceOf(Error);

            expect(error.message).toBe('El campo del apartamentoUI solo acepta una cadena de mayúsculas, minúsculas, números, vocales acentuadas, espacios y los siguientes caracteres: _, -, ., /, (), y %');
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

            expect(error).toBeInstanceOf(Error);

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

            expect(error).toBeInstanceOf(Error);

            expect(error.message).toBe('El campo del camaUI solo acepta una cadena de mayúsculas, minúsculas, números, vocales acentuadas, espacios y los siguientes caracteres: _, -, ., /, (), y %');
        }
    })


    test('createEntity bed ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "cama",
                camaUI: "Nueva cama para testing",
                camaIDV: camaIDV,
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
                habitacionIDV: habitacionIDV
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
                entidadIDV: habitacionIDV
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
                entidadIDV: camaIDV
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

            expect(error).toBeInstanceOf(Error);

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

            expect(error).toBeInstanceOf(Error);

        }
    })

    test('error by type unexpected in entidadIDV', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "habitacion1",

                },
                session: fakeAdminSession
            }
            const response = await crearEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {

            expect(error).toBeInstanceOf(Error);

        }
    })


    test('error by type unexpected in entidadIDV', async () => {
        try {
            const makeEntity = {
                body: {

                    entidadIDV: 5
                },
                session: fakeAdminSession
            }
            const response = await crearEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {

            expect(error).toBeInstanceOf(Error);

        }
    })
    test('update entity apartamento with ok', async () => {

        const makeEntity = {
            body: {
                tipoEntidad: "apartamento",
                entidadIDV: apartamentoIDV,
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI,
                numeroHuespedes: "1",
                descripcion: "",
                apartamentoUIPublico: "apartamento actualziado",
                definicionPublica: "Definicion actualizada",
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

            expect(error).toBeInstanceOf(Error);

        }
    })


    test('update entity room with ok', async () => {

        const makeEntity = {
            body: {
                tipoEntidad: "habitacion",
                entidadIDV: habitacionIDV,
                habitacionIDV: habitacionIDV,
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

            expect(error).toBeInstanceOf(Error);

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

            expect(error).toBeInstanceOf(Error);

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

            expect(error).toBeInstanceOf(Error);

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

            expect(error).toBeInstanceOf(Error);

        }
    })

    test('delete room', async () => {

        const makeEntity = {
            body: {
                tipoEntidad: "habitacion",
                entidadIDV: habitacionIDV
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
                entidadIDV: camaIDV,
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
                entidadIDV: apartamentoIDV,

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

            expect(error).toBeInstanceOf(Error);

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

            expect(error).toBeInstanceOf(Error);

        }
    })

    test('error on tipoEntidad', async () => {
        try {
            const makeEntity = {
                body: {

                    entidadIDV: "apartamentoparatesting22"
                },
                session: fakeAdminSession
            }
            const response = await eliminarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {

            expect(error).toBeInstanceOf(Error);

        }
    })

    test('error on tipoEntidad', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: "apartamento1",

                },
                session: fakeAdminSession
            }
            const response = await eliminarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {

            expect(error).toBeInstanceOf(Error);

        }
    })


    test('error on tipoEntidad', async () => {
        try {
            const makeEntity = {
                body: {
                    tipoEntidad: 2,

                },
                session: fakeAdminSession
            }
            const response = await eliminarEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {

            expect(error).toBeInstanceOf(Error);

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

            expect(error).toBeInstanceOf(Error);

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

            expect(error).toBeInstanceOf(Error);

        }
    })


    afterAll(async () => {
        await eliminarApartamentoComoEntidad(apartamentoIDV)
        await eliminarCamaComoEntidad(camaIDV)
        await eliminarHabitacionComoEntidad(habitacionIDV)
    })
})
