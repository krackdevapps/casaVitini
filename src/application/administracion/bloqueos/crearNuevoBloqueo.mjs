import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../shared/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";

import { obtenerConfiguracionPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { insertarNuevoBloqueo } from "../../../infraestructure/repository/bloqueos/insertarNuevoBloqueo.mjs";
import { valdiarEsquemaEntrada } from "../../../shared/bloqueos/validarEsquemaEntrada.mjs";

export const crearNuevoBloqueo = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()


        valdiarEsquemaEntrada(entrada.body)

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 6
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const tipoBloqueoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoBloqueoIDV,
            nombreCampo: "El tipoBloqueo",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        let motivo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.motivo || "",
            nombreCampo: "El campo del motivo",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const zonaIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.zonaIDV,
            nombreCampo: "El zonaIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        await eliminarBloqueoCaducado()
        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        if (!configuracionApartamento?.apartamentoIDV) {
            const error = "No existe el identificador del apartamento";
            throw new Error(error);
        }
        if (tipoBloqueoIDV !== "permanente" && tipoBloqueoIDV !== "rangoTemporal") {
            const error = "tipoBloqueoIDV solo puede ser permanente o rangoTemporal";
            throw new Error(error);
        }
        if (zonaIDV !== "global" && zonaIDV !== publica && zonaIDV !== "privada") {
            const error = "zona solo puede ser global, publico o privada";
            throw new Error(error);
        }
        const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;
        let fechaInicio = null;
        let fechaFin = null;
        if (tipoBloqueoIDV === "rangoTemporal") {
            const fechaInicio_validada = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: entrada.body.fechaInicio,
                nombreCampo: "La fecha de inicio"
            })
            const fechaFin_validada = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: entrada.body.fechaFin,
                nombreCampo: "La fecha de fin"
            })
            fechaInicio = fechaInicio_validada;
            fechaFin = fechaFin_validada;
            const fechaInicio_Objeto = DateTime.fromISO(fechaInicio);
            const fechaFin_Objeto = DateTime.fromISO(fechaFin);
            if (fechaInicio_Objeto > fechaFin_Objeto) {
                const error = "La fecha de inicio del bloqueo no puede ser inferior a la fecha de fin del bloqueo, si puede ser igual para determinar un solo día.";
                throw new Error(error);
            }
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const tiempoZH = DateTime.now().setZone(zonaHoraria).startOf('day');
            const fechaFin_TZ_Objeto = DateTime.fromISO(fechaFin, { zone: zonaHoraria });
            if (tiempoZH > fechaFin_TZ_Objeto) {
                const error = "La fecha de fin del bloqueo no puede ser inferior a la fecha actual, porque estarías creando un bloqueo enteramente en el pasado. Puedes crear un bloqueo que empieza en el pasado, pero debe que acabar en el futuro o en hoy. Los bloqueos que acaban en el pasado son automáticamente borrados por ser bloqueos caducos.";
                throw new Error(error);
            }
        }
        if (motivo) {
            if (!filtroTextoSimple.test(motivo)) {
                const error = "Por temas de seguridad, ahora mismo en el campo motivo, solo pueden aceptarse minúsculas, mayúsculas, espacio y números. Más adelante se aceptarán todos los caracteres.";
                throw new Error(error);
            }
        } else {
            motivo = null;
        }

        const datosNuevoBloqueo = {
            apartamentoIDV,
            tipoBloqueoIDV,
            fechaInicio,
            fechaFin,
            motivo,
            zonaIDV
        }

        const nuevoBloquoe = await insertarNuevoBloqueo(datosNuevoBloqueo)

        const nuevoUIDBloqueo = nuevoBloquoe.bloqueoUID;
        const ok = {
            ok: "Se ha creado el bloqueo correctamente",
            nuevoBloqueoUID: nuevoUIDBloqueo,
            apartamentoIDV: apartamentoIDV
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}