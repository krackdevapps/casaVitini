
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { DateTime } from 'luxon';
import { guardarSimulacion } from '../../../src/application/administracion/simuladorDePrecios/guardarSimulacion.mjs';
import { eliminarSimulacionPorTestingVI } from '../../../src/infraestructure/repository/simulacionDePrecios/eliminarSimulacionPorTestingVI.mjs';
import { eliminarOfertaPorTestingVI } from '../../../src/infraestructure/repository/ofertas/eliminarOfertaPorTestingVI.mjs';
import { crearOferta } from '../../../src/application/administracion/ofertas/crearOferta.mjs';
import { insertarDescuentoPorCompatible as insertarDescuentoPorCompatible_reserva } from '../../../src/application/administracion/reservas/detallesReserva/descuentos/insertarDescuentoPorCompatible.mjs';
import { insertarDescuentoPorAdministrador as insertarDescuentoPorAdministrador_reserva } from '../../../src/application/administracion/reservas/detallesReserva/descuentos/insertarDescuentoPorAdministrador.mjs';
import { actualizarSimulacionPorDataGlobal } from '../../../src/application/administracion/simuladorDePrecios/actualizarSimulacionPorDataGlobal.mjs';
import { insertarDescuentoPorAdministrador as insertarDescuentoPorAdministrador_simulacion } from '../../../src/application/administracion/simuladorDePrecios/descuentos/insertarDescuentoPorAdministrador.mjs';
import { insertarDescuentoPorCompatible as insertarDescuentoPorCompatible_simulacion } from '../../../src/application/administracion/simuladorDePrecios/descuentos/insertarDescuentoPorCompatible.mjs';
import { detallesOferta } from '../../../src/application/administracion/ofertas/detallesOferta.mjs';
import { modificarEntidadAlojamiento } from '../../../src/application/administracion/arquitectura/entidades/modificarEntidadAlojamiento.mjs';
import { obtenerReserva } from '../../../src/application/administracion/reservas/detallesReserva/global/obtenerReserva.mjs';
import { actualizarSobreControlNoche as actualizarSobreControlNoche_reserva } from '../../../src/application/administracion/reservas/detallesReserva/sobreControlPrecios/actualizarSobreControlNoche.mjs';
import { actualizarSobreControlNoche as actualizarSobreControlNoche_simulacion } from '../../../src/application/administracion/simuladorDePrecios/sobreControlPrecios/actualizarSobreControlNoche.mjs';
import { detallesSimulacion } from '../../../src/application/administracion/simuladorDePrecios/detallesSimulacion.mjs';
import { insertarAlojamientoEnSimulacion } from '../../../src/application/administracion/simuladorDePrecios/alojamiento/insertarAlojamientoEnSimulacion.mjs';

describe('critical: updating hosting entity with offers existing', () => {
    const testingVI = "testingcritical"
    const apartamentoIDV = "apartamentocriticalflow"
    const apartamentoUI = "Apartamento para testing de un critical flow"
    const habitacionIDV = "habitaciontesting"
    const habitacionUI = "Habitacion para testing critical flow"
    const camaIDV = "camatesting"
    const camaUI = "Cama para testing critical flow"
    const apartamentoIDV_actualizado = "apartamentoactualizado00000000000"
    let reservaUID
    let simulacionUID
    let ofertaUID_type1
    let ofertaUID_type2
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }

    const fakeOfferType1 = {
        nombreOferta: "oferta creadad para testing tipo 1",
        zonaIDV: "global",
        entidadIDV: "reserva",
        fechaInicio: "2026-10-10",
        fechaFinal: "2026-10-20",
        condicionesArray: [
            {
                "tipoCondicion": "porApartamentosEspecificos",
                "tipoDeEspecificidad": "alguno",
                "apartamentos": [
                    {
                        "apartamentoIDV": apartamentoIDV
                    },


                ]
            },
        ],
        descuentosJSON: {
            "tipoDescuento": "porRango",
            "descuentoPorDias": [
                {
                    "fecha": "2024-09-23",
                    "apartamentos": [
                        {
                            "apartamentoIDV": apartamentoIDV,
                            "descuentoTotal": "66.00",
                            "tipoAplicacion": "cantidadFija"
                        },
                        {
                            "apartamentoIDV": apartamentoIDV,
                            "descuentoTotal": "77.00",
                            "tipoAplicacion": "cantidadFija"
                        }
                    ],
                    "tipoDescuento": "netoPorApartamentoDelDia"
                }
            ],
            "subTipoDescuento": "porDiasDelRango",
            "fechaFinalRango_ISO": "2024-09-24",
            "fechaInicioRango_ISO": "2024-09-23"
        }
    }
    const fakeOfferType2 = {
        nombreOferta: "oferta creadad para testing tipo 2",
        zonaIDV: "global",
        entidadIDV: "reserva",
        fechaInicio: "2026-10-10",
        fechaFinal: "2026-10-20",
        condicionesArray: [
            {
                "tipoCondicion": "conFechaCreacionEntreRango"
            },
        ],
        descuentosJSON: {
            "apartamentos": [
                {
                    "apartamentoIDV": apartamentoIDV,
                    "descuentoTotal": "20.00",
                    "tipoAplicacion": "porcentaje"
                },
                {
                    "apartamentoIDV": apartamentoIDV,
                    "descuentoTotal": "10.00",
                    "tipoAplicacion": "porcentaje"
                }
            ],
            "tipoDescuento": "individualPorApartamento"
        }
    }
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_actualizado,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        await eliminarReservaPorTestingVI(testingVI)
        await eliminarSimulacionPorTestingVI(testingVI)
        await eliminarOfertaPorTestingVI(testingVI)

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



    const fechaCreacionVirtual = DateTime.utc().toISO();
    const fechaInicioVirutal_futuro = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 2 }).toISODate();
    const fechaFinalVirtual_futuro = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 3 }).toISODate();
    const fechaCreacionSimulacion = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 5 }).toISODate();
    const fechaInicioVirutal_pasado = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 4 }).toISODate();
    const fechaFinalVirtual_pasado = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 3 }).toISODate();

    test('create booking with ok', async () => {
        const m = {
            body: {
                fechaEntrada: fechaInicioVirutal_futuro,
                fechaSalida: fechaFinalVirtual_futuro,
                apartamentos: [apartamentoIDV],
                estadoInicialIDV: "confirmada",
                estadoInicialOfertasIDV: "noAplicarOfertas"

            },
            session: fakeAdminSession
        }
        const response = await crearReservaSimpleAdministrativa(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        reservaUID = response.reservaUID
    })

    test('add override in price of apartment with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                apartamentoIDV: apartamentoIDV,
                fechaNoche: fechaInicioVirutal_futuro,
                tipoOperacion: "aumentarPorPorcentaje",
                valorSobreControl: "10.00"
            },
            session: fakeAdminSession
        }
        const response = await actualizarSobreControlNoche_reserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('create offer type1 with ok', async () => {
        const m = {
            body: {
                ...fakeOfferType1
            },
            session: fakeAdminSession
        }
        const response = await crearOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        ofertaUID_type1 = response.oferta.ofertaUID
    })
    test('create offer type2 with ok', async () => {
        const m = {
            body: {
                ...fakeOfferType2
            },
            session: fakeAdminSession
        }
        const response = await crearOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        ofertaUID_type2 = response.oferta.ofertaUID
    })
    test('insert compatible discount type1 in bookin with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                ofertaUID: String(ofertaUID_type1),

            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorCompatible_reserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert compatible discount type2 in bookin with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                ofertaUID: String(ofertaUID_type2),

            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorCompatible_reserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert administrativie discount type1 in bookin with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                ofertaUID: String(ofertaUID_type1),

            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorAdministrador_reserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert administrativie discount type2 in bookin with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                ofertaUID: String(ofertaUID_type2),

            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorAdministrador_reserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('create initial and save void simulation with ok', async () => {
        const m = {
            body: {
                nombre: "Simulacion temporal y volatil para testing",

            },
            session: fakeAdminSession
        }
        const response = await guardarSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        simulacionUID = response.simulacionUID
    })
    test('insert hostin in simulation with ok', async () => {
        const response = await insertarAlojamientoEnSimulacion({
            body: {
                simulacionUID: String(simulacionUID),
                apartamentoIDV: String(apartamentoIDV)
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert global data in simulation created with ok', async () => {
        const m = {
            body: {
                simulacionUID: simulacionUID,
                fechaCreacion: "2026-10-10",
                fechaEntrada: "2026-10-11",
                fechaSalida: "2026-10-14",
                zonaIDV: "global",
                apartamentosIDVARRAY: [apartamentoIDV],
            },
            session: fakeAdminSession
        }
        const response = await actualizarSimulacionPorDataGlobal(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update price in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                apartamentoIDV: apartamentoIDV,
                fechaNoche: "2026-10-11",
                tipoOperacion: "aumentarPorPorcentaje",
                valorSobreControl: "10.00"
            },
            session: fakeAdminSession
        }
        const response = await actualizarSobreControlNoche_simulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert offer administrative type1 in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                ofertaUID: String(ofertaUID_type1)
            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorAdministrador_simulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert offer administrative type2 in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                ofertaUID: String(ofertaUID_type2)
            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorAdministrador_simulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert offer compatible type1 in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                ofertaUID: String(ofertaUID_type1)
            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorCompatible_simulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert offer compatible type2 in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                ofertaUID: String(ofertaUID_type2)
            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorCompatible_simulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update entity apartamento with ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "apartamento",
                entidadIDV: apartamentoIDV,
                apartamentoIDV: apartamentoIDV_actualizado,
                apartamentoUI: apartamentoUI,
                apartamentoUIPublico: "Apartamento",
                definicionPublica: "definicion",
                caracteristicas: [
                    "testing"
                ]
            },
            session: fakeAdminSession
        }
        const response = await modificarEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
    })

    test('get details of offer type 1 and validate new idv of apartments with ok', async () => {
        const m = {
            body: {
                ofertaUID: String(ofertaUID_type1),
            },
            session: fakeAdminSession
        }
        const response = await detallesOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');


        let interruptorCondicionPorApartamentosEspecificos = false
        const condicionesArray = response.ok.condicionesArray
        condicionesArray.forEach(condicion => {
            const tipoCondicion = condicion.tipoCondicion
            if (tipoCondicion === "porApartamentosEspecificos") {
                const apartamentos = condicion.apartamentos
                apartamentos.forEach((apartamento) => {
                    const aparamentoIDV_enCondicion = apartamento.apartamentoIDV

                    if (aparamentoIDV_enCondicion === apartamentoIDV_actualizado) {
                        interruptorCondicionPorApartamentosEspecificos = true;

                        expect(aparamentoIDV_enCondicion).toBe(apartamentoIDV_actualizado);
                    }
                })

            }
        })
        let interruptorDescuentosApartamentosEspecificos = false
        const descuentosJSON = response.ok.descuentosJSON
        descuentosJSON.descuentoPorDias.forEach((contenedor) => {
            const apartamentos = contenedor.apartamentos
            apartamentos.forEach((a) => {
                const apartamentosIDV_enDescuentos = a.apartamentoIDV
                if (apartamentosIDV_enDescuentos === apartamentoIDV_actualizado) {
                    interruptorDescuentosApartamentosEspecificos = true;

                    expect(apartamentosIDV_enDescuentos).toBe(apartamentoIDV_actualizado);
                }
            })
        })
        expect(interruptorDescuentosApartamentosEspecificos).toBe(true);
        expect(interruptorCondicionPorApartamentosEspecificos).toBe(true);
    })
    test('get details of offer type 2 and validate new idv of apartments with ok', async () => {
        const m = {
            body: {
                ofertaUID: String(ofertaUID_type2),
            },
            session: fakeAdminSession
        }
        const response = await detallesOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

        let interruptorDescuentosApartamentosEspecificos = false

        const descuentosJSON = response.ok.descuentosJSON
        descuentosJSON.apartamentos.forEach((contenedor) => {
            const apartamentosIDV_enDescuentos = contenedor.apartamentoIDV
            if (apartamentosIDV_enDescuentos === apartamentoIDV_actualizado) {
                interruptorDescuentosApartamentosEspecificos = true;

                expect(apartamentosIDV_enDescuentos).toBe(apartamentoIDV_actualizado);
            }
        })
        expect(interruptorDescuentosApartamentosEspecificos).toBe(true);
    })
    test('get details of booking and test for updated IDV with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                capas: [
                    "alojamiento",
                    "desgloseFinanciero"
                ]
            },
            session: fakeAdminSession
        }
        const response = await obtenerReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        const reserva = response.ok
        const alojamiento = reserva.alojamiento
        const contenedorFinanciero = reserva.contenedorFinanciero
        const instantaneaNoches = contenedorFinanciero.instantaneaNoches
        const instantaneaSobreControlPrecios = contenedorFinanciero.instantaneaSobreControlPrecios
        const instantaneaOfertasPorAdministrador = contenedorFinanciero.instantaneaOfertasPorAdministrador
        const instantaneaOfertasPorCondicion = contenedorFinanciero.instantaneaOfertasPorCondicion
        const instantaneaOfertas = [
            ...instantaneaOfertasPorAdministrador,
            ...instantaneaOfertasPorCondicion
        ]

        let interruptorAlojamiento = false
        Object.entries(alojamiento).forEach(([apartamentoIDV_enAlojamiento, contenedor]) => {
            expect(apartamentoIDV_enAlojamiento).toBe(apartamentoIDV_actualizado);
            if (apartamentoIDV_enAlojamiento === apartamentoIDV_actualizado) {
                interruptorAlojamiento = true;
                expect(apartamentoIDV_enAlojamiento).toBe(apartamentoIDV_actualizado);
            }

        })
        expect(interruptorAlojamiento).toBe(true);

        let interruptorInstantaneaNoches = false
        for (const contenedorNoche of Object.values(instantaneaNoches)) {
            const apartamentosPorNoche = contenedorNoche.apartamentosPorNoche;
            for (const [apartamentoIDV_enInstantanea, contenedorApartamento] of Object.entries(apartamentosPorNoche)) {
                if (apartamentoIDV_enInstantanea === apartamentoIDV_actualizado) {
                    interruptorInstantaneaNoches = true;
                    expect(apartamentoIDV_enInstantanea).toBe(apartamentoIDV_actualizado);
                }
            }
        }
        expect(interruptorInstantaneaNoches).toBe(true);

        let interruptorSobreControl = false
        for (const sobreControl of Object.values(instantaneaSobreControlPrecios)) {
            Object.keys(sobreControl).forEach((apartamentoIDV_sobreControl) => {
                if (apartamentoIDV_sobreControl === apartamentoIDV_actualizado) {
                    interruptorSobreControl = true;
                    expect(apartamentoIDV_sobreControl).toBe(apartamentoIDV_actualizado);
                }
            })
        }
        expect(interruptorSobreControl).toBe(true);

        let interruptor_oferta_individualPorApartamento = false
        let interruptor_oferta_porRangoDias = false
        let interruptor_oferta_porApartamentosEspecificos = false

        for (const contenedorOferta of instantaneaOfertas) {

            const contenedorDescuentos = contenedorOferta.oferta?.descuentosJSON || {}
            const contenedorContediciones = contenedorOferta.oferta?.condicionesArray || []

            const tipoDescuento = contenedorDescuentos.tipoDescuento
            if (tipoDescuento === "individualPorApartamento") {
                const contenedorApartamentos = contenedorDescuentos.apartamentos
                for (const apartamento of contenedorApartamentos) {
                    const apartamentoIDV_ipa = apartamento.apartamentoIDV
                    if (apartamentoIDV_ipa === apartamentoIDV_actualizado) {
                        interruptor_oferta_individualPorApartamento = true;
                        expect(apartamentoIDV_ipa).toBe(apartamentoIDV_actualizado);
                    }
                }
            } else if (tipoDescuento === "porRango") {
                const subTipoDescuento = contenedorDescuentos.subTipoDescuento
                if (subTipoDescuento === "porDiasDelRango") {
                    const contenedorDias = contenedorDescuentos.descuentoPorDias
                    for (const dia of contenedorDias) {
                        const apartamentos = dia.apartamentos || []
                        for (const apartamento of apartamentos) {
                            const apartamentoIDV_pr = apartamento.apartamentoIDV
                            if (apartamentoIDV_pr === apartamentoIDV_actualizado) {
                                interruptor_oferta_porRangoDias = true;
                                expect(apartamentoIDV_pr).toBe(apartamentoIDV_actualizado);
                            }
                        }
                    }
                }
            }

            for (const contenedorCondicion of contenedorContediciones) {
                const tipoCondicion = contenedorCondicion.tipoCondicion
                if (tipoCondicion === "porApartamentosEspecificos") {
                    const contenedorApartamentosIDV = contenedorCondicion.apartamentos
                    for (const contenedorApartamento of contenedorApartamentosIDV) {
                        const apartamentoIDV_pae = contenedorApartamento.apartamentoIDV
                        if (apartamentoIDV_pae === apartamentoIDV_actualizado) {
                            interruptor_oferta_porApartamentosEspecificos = true;
                            expect(apartamentoIDV_pae).toBe(apartamentoIDV_actualizado);
                        }
                    }
                }
            }
        }


        expect(interruptor_oferta_individualPorApartamento).toBe(true);
        expect(interruptor_oferta_porRangoDias).toBe(true);
        expect(interruptor_oferta_porApartamentosEspecificos).toBe(true);


    })
    test('get details of booking simulation and test for updates IDV with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID)
            },
            session: fakeAdminSession
        }
        const response = await detallesSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        const simulacion = response.ok
        const contenedorFinanciero = response.contenedorFinanciero
        const apartamentosIDVARRAY = contenedorFinanciero.apartamentosIDVARRAY


        const instantaneaNoches = contenedorFinanciero.instantaneaNoches
        const instantaneaSobreControlPrecios = contenedorFinanciero.instantaneaSobreControlPrecios
        const instantaneaOfertasPorAdministrador = contenedorFinanciero.instantaneaOfertasPorAdministrador
        const instantaneaOfertasPorCondicion = contenedorFinanciero.instantaneaOfertasPorCondicion
        const instantaneaOfertas = [
            ...instantaneaOfertasPorAdministrador,
            ...instantaneaOfertasPorCondicion
        ]

        let interruptorInstantaneaNoches = false
        for (const contenedorNoche of Object.values(instantaneaNoches)) {
            const apartamentosPorNoche = contenedorNoche.apartamentosPorNoche;
            for (const [apartamentoIDV_enInstantanea, contenedorApartamento] of Object.entries(apartamentosPorNoche)) {
                if (apartamentoIDV_enInstantanea === apartamentoIDV_actualizado) {
                    interruptorInstantaneaNoches = true;
                    expect(apartamentoIDV_enInstantanea).toBe(apartamentoIDV_actualizado);
                }
            }
        }
        expect(interruptorInstantaneaNoches).toBe(true);

        let interruptorSobreControl = false
        for (const sobreControl of Object.values(instantaneaSobreControlPrecios)) {
            Object.keys(sobreControl).forEach((apartamentoIDV_sobreControl) => {
                if (apartamentoIDV_sobreControl === apartamentoIDV_actualizado) {
                    interruptorSobreControl = true;
                    expect(apartamentoIDV_sobreControl).toBe(apartamentoIDV_actualizado);
                }
            })
        }
        expect(interruptorSobreControl).toBe(true);

        let interruptor_oferta_individualPorApartamento = false
        let interruptor_oferta_porRangoDias = false
        let interruptor_oferta_porApartamentosEspecificos = false

        for (const contenedorOferta of instantaneaOfertas) {

            const contenedorDescuentos = contenedorOferta.oferta?.descuentosJSON || {}
            const contenedorContediciones = contenedorOferta.oferta?.condicionesArray || []

            const tipoDescuento = contenedorDescuentos.tipoDescuento
            if (tipoDescuento === "individualPorApartamento") {
                const contenedorApartamentos = contenedorDescuentos.apartamentos
                for (const apartamento of contenedorApartamentos) {
                    const apartamentoIDV_ipa = apartamento.apartamentoIDV
                    if (apartamentoIDV_ipa === apartamentoIDV_actualizado) {
                        interruptor_oferta_individualPorApartamento = true;
                        expect(apartamentoIDV_ipa).toBe(apartamentoIDV_actualizado);
                    }
                }
            } else if (tipoDescuento === "porRango") {
                const subTipoDescuento = contenedorDescuentos.subTipoDescuento
                if (subTipoDescuento === "porDiasDelRango") {
                    const contenedorDias = contenedorDescuentos.descuentoPorDias
                    for (const dia of contenedorDias) {
                        const apartamentos = dia.apartamentos || []
                        for (const apartamento of apartamentos) {
                            const apartamentoIDV_pr = apartamento.apartamentoIDV
                            if (apartamentoIDV_pr === apartamentoIDV_actualizado) {
                                interruptor_oferta_porRangoDias = true;
                                expect(apartamentoIDV_pr).toBe(apartamentoIDV_actualizado);
                            }
                        }
                    }
                }
            }

            for (const contenedorCondicion of contenedorContediciones) {
                const tipoCondicion = contenedorCondicion.tipoCondicion
                if (tipoCondicion === "porApartamentosEspecificos") {
                    const contenedorApartamentosIDV = contenedorCondicion.apartamentos
                    for (const contenedorApartamento of contenedorApartamentosIDV) {
                        const apartamentoIDV_pae = contenedorApartamento.apartamentoIDV
                        if (apartamentoIDV_pae === apartamentoIDV_actualizado) {
                            interruptor_oferta_porApartamentosEspecificos = true;
                            expect(apartamentoIDV_pae).toBe(apartamentoIDV_actualizado);
                        }
                    }
                }
            }
        }
        expect(interruptor_oferta_individualPorApartamento).toBe(true);
        expect(interruptor_oferta_porRangoDias).toBe(true);
        expect(interruptor_oferta_porApartamentosEspecificos).toBe(true);
    })
    afterAll(async () => {
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_actualizado,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await eliminarOfertaPorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarSimulacionPorTestingVI(testingVI)

    });
})
