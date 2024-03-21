import { DateTime } from 'luxon';
import { conexion } from '../db.mjs';
import { apartamentosDisponiblesPublico } from './apartamentosDisponiblesPublico.mjs';
import { codigoZonaHoraria } from './codigoZonaHoraria.mjs';
import { validadoresCompartidos } from '../validadoresCompartidos.mjs'
import { obtenerParametroConfiguracion } from './obtenerParametroConfiguracion.mjs';
import { limitesReservaPublica } from './limitesReservaPublica.mjs';
import { resolverApartamentoUI } from './resolverApartamentoUI.mjs'
import { resolverCamaUI } from './resolverCamaUI.mjs';
import { resolverHabitacionUI } from './resolverHabitacionUI.mjs';


const validarObjetoReserva = async (reserva) => {

    try {
        // Control validez fecha
        const fechaEntrada_Humano = reserva.entrada
        const fechaSalida_Humano = reserva.salida
        await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada_Humano)
        await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida_Humano)

        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada_Humano)).fecha_ISO
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida_Humano)).fecha_ISO


        let nombreTitular = reserva.datosTitular?.nombreTitular || ""
        let pasaporteTitular = reserva.datosTitular?.pasaporteTitular || ""
        let telefonoTitular = reserva.datosTitular?.telefonoTitular || ""
        let correoTitular = reserva.datosTitular?.correoTitular || ""

        nombreTitular = nombreTitular
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .trim()
            .toUpperCase()
            .replaceAll("  ", " ");
        if (!nombreTitular || typeof nombreTitular !== "string" || nombreTitular.length > 50) {
            const error = "Por favor escribe el nombre del titular de la reserva"
            throw new Error(error)
        }
        reserva.datosTitular.nombreTitular = nombreTitular

        pasaporteTitular = pasaporteTitular
            .replace(/[^a-zA-Z0-9]/g, "")
            .trim()
            .toUpperCase()
        if (!pasaporteTitular || typeof pasaporteTitular !== "string" || pasaporteTitular.length > 50) {
            const error = "Por favor escribe el numero de pasaporte del titular de la reserva si este es de fuera de nicaragua o el documento de identidad nacional."
            throw new Error(error)
        }
        reserva.datosTitular.pasaporteTitular = pasaporteTitular

        telefonoTitular = telefonoTitular
            .replaceAll("  ", " ")
            .replace("+", "00")
            .replace(/[^0-9]/g, "")
            .trim()
        if (!telefonoTitular || typeof telefonoTitular !== "string" || telefonoTitular.length > 50) {
            const error = "Por favor escribe el numero de telefono del titular de la reserva para que podamos ponernos en contacto si fuera necesario."
            throw new Error(error)
        }
        reserva.datosTitular.telefonoTitular = telefonoTitular

        const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
        correoTitular = correoTitular
            .trim()
            .toLowerCase()
        if (!correoTitular || typeof correoTitular !== "string" || correoTitular.length > 50 || !filtroCorreoElectronico.test(correoTitular)) {
            const error = "Por favor escribe un correo electroníco valido. Sea tan amable de cerciorarse que este tenga el formado adecuado. Un correo electroníco tiene un formato como este usurario_de_ejemplo@servidor_de_ejemplo.zona_de_ejemplo"
            throw new Error(error)
        }
        const validarDominio = (correo) => {
            const selectorDominio = /@([a-zA-Z0-9.-]+)\.[a-zA-Z]{2,}/;
            const match = correo.match(selectorDominio);
            const dominio = match[1].toLowerCase();
            const dominiosPermitidos = [
                "gmail",
                "hotmail",
                "outlook",
                "icloud"
            ];
            if (!dominiosPermitidos.includes(dominio)) {
                const error = "Por temas de seguridad y con el fin de usar sistema de correo de confianza, solo aceptamos direciones de correo electronico de @gmail, @outlook, @icloud, @hotmail. No hacemos otros dominios con el fin de evitar los correos electronicos temporales"
                throw new Error(error)
            }
        };
        //validarDominio(correoTitular)
        reserva.datosTitular.correoTitular = correoTitular
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualTZ = tiempoZH.toISODate()

        const fechaEntradaReserva_ISO = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria });
        const fechaSalidaReserva_ISO = DateTime.fromISO(fechaSalida_ISO, { zone: zonaHoraria });

        if (fechaEntradaReserva_ISO < fechaActualTZ) {
            const error = "La fecha de entrada no puede ser anterior a la fecha actual"
            throw new Error(error)
        }

        // validacion: la fecha de entrada no puede ser superior a la fecha de salida y al mimso tiempo la fecha de salida no puede ser inferior a la fecha de entrada
        if (fechaEntradaReserva_ISO >= fechaSalidaReserva_ISO) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida"
            throw new Error(error)
        }

        const fechasParaValidarLimites = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO
        }

        await limitesReservaPublica(fechasParaValidarLimites)
        
        const alojamiento = reserva?.alojamiento
        if (!alojamiento) {
            const error = "No exite la llave de 'Alojamiento' esperada dentro del objeto, por lo tante hasta aquí hemos llegado"
            throw new Error(error)
        }

        // Comprobara que existen los apartamentos que se piden
        const fecha = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO
        }
        const resueleApartamentosDisponibles = await apartamentosDisponiblesPublico(fecha)
        const apartamentosDisponibles = resueleApartamentosDisponibles?.apartamentosDisponibles

        if (apartamentosDisponibles.length === 0) {
            const error = "No hay ningun apartamento disponible"
            throw new Error(error)
        }
        if (alojamiento !== null && typeof alojamiento !== 'object' && alojamiento.constructor !== Object) {
            const error = "Se esparaba un objeto para validar el alojamiento"
            throw new Error(error)
        }
        const apartemtosIDVarray = Object.keys(alojamiento)

        const controlApartamentosIDVUnicos = new Set(apartemtosIDVarray);
        if (controlApartamentosIDVUnicos.size !== apartemtosIDVarray.length) {
            const error = "Existen apartamentosIDV repetidos en el objeto de la reserva"
            throw new Error(error)
        }

        for (const apartamento of Object.entries(alojamiento)) {
            const apartamentoIDV = apartamento[0]
            const habitacionesDelApartamentoPorValidar = apartamento[1].habitaciones
            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;

            if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                const error = "el campo apartamentoIDV solo puede ser letras minúsculas y numeros. sin pesacios"
                throw new Error(error)
            }

            if (!apartamentosDisponibles.includes(apartamentoIDV)) {               
                const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)
                const error = `Atencion, sentimos informar que el '${apartamentoUI}' no esta disponible para reservar`
                throw new Error(error)
            }

            if (habitacionesDelApartamentoPorValidar !== null && typeof habitacionesDelApartamentoPorValidar !== 'object' && habitacionesDelApartamentoPorValidar.constructor !== Object) {
                const error = "Se esparaba un objeto para validar las habitaciones"
                throw new Error(error)

            }
            const consultaHabitacionesPorApartamento = `
            SELECT 
            habitacion,
            uid
            FROM
            "configuracionHabitacionesDelApartamento"
            WHERE
            apartamento = $1;
            `
            const resuelveConsultaHabitacionesPorApartamento = await conexion.query(consultaHabitacionesPorApartamento, [apartamentoIDV])
            const habitacionesPorApartamento = resuelveConsultaHabitacionesPorApartamento.rows
            if (habitacionesPorApartamento.rowCount === 0) {
                const error = `El apartamento ${apartamentoIDV} no tiene ninguna habitacion configurada`
                throw new Error(error)
            }
            const habitacionesEstructura = {}
            const habitacionesSoloIDV = []
            habitacionesPorApartamento.map((habitacionApartamento) => {
                const habitacionIDV = habitacionApartamento.habitacion
                const habitacionUID = habitacionApartamento.uid
                habitacionesEstructura[habitacionIDV] = habitacionUID
                habitacionesSoloIDV.push(habitacionIDV)
            })
            // 

            for (const detallesHabitacion of Object.entries(habitacionesDelApartamentoPorValidar)) {
                const habitacionIDVPorValidar = detallesHabitacion[0]
                if (!habitacionIDVPorValidar || !filtroCadenaMinusculasSinEspacios.test(habitacionIDVPorValidar)) {
                    const error = "el campo habitacionIDV solo puede ser letras minúsculas y numeros. sin pesacios"
                    throw new Error(error)
                }
                if (!habitacionesSoloIDV.includes(habitacionIDVPorValidar)) {
                    const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)

                    const error = `El ${apartamentoUI} contiene una habitacion que no existe, concretamente la habitacion ${habitacionIDVPorValidar}`
                    throw new Error(error)
                }
            }
            for (const habitacion of Object.entries(habitacionesDelApartamentoPorValidar)) {
                const habitacionIDV = habitacion[0]
                const habitacionUID = habitacionesEstructura[habitacionIDV]
                const camaIDV = habitacion[1]?.camaSeleccionada?.camaIDV
                if (!camaIDV || !filtroCadenaMinusculasSinEspacios.test(camaIDV)) {
                    const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)
                    console.log("habitacionIDV", habitacionIDV)
                    const habitacionUI = await resolverHabitacionUI(habitacionIDV)                  

                    const error = `Por favor selecciona el tipo de cama de la ${habitacionUI} del apartamento ${apartamentoUI}`
                    throw new Error(error)
                }
                const consultaCamasDeHabitacion = `
                SELECT
                cama
                FROM
                "configuracionCamasEnHabitacion"
                WHERE
                habitacion = $1 AND cama = $2;
                `
                const resuelveCamasDeHabitacion = await conexion.query(consultaCamasDeHabitacion, [habitacionUID, camaIDV])
                if (resuelveCamasDeHabitacion.rowCount === 0) {
                    const error = `Dentro de la habitacion ${habitacionIDV} del apartamento ${apartamentoIDV} no exista la cama ${camaIDV}`
                    throw new Error(error)
                }

            }
        }
        const ok = {
            ok: "No hay errores en la validacion"
        }
        return ok
    } catch (error) {
        throw error;
    }


}


export {
    validarObjetoReserva
};