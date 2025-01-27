import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { obtenerBloqueoPorBloqueoUID } from "../../../infraestructure/repository/bloqueos/obtenerBloqueoPorBloqueoUID.mjs";
import { actualizarBloqueoPorBloqueoUID } from "../../../infraestructure/repository/bloqueos/actualizarBloqueoPorBloqueoUID.mjs";
import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../shared/configuracion/codigoZonaHoraria.mjs";
import { valdiarEsquemaEntrada } from "../../../shared/bloqueos/validarEsquemaEntrada.mjs";

export const modificarBloqueo = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()


        valdiarEsquemaEntrada(entrada.body)


        const bloqueoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.bloqueoUID,
            nombreCampo: "El identificador universal de la bloque (bloqueoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const tipoBloqueoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoBloqueoIDV,
            nombreCampo: "El tipoBloqueoIDV",
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
        if (!motivo) {
            motivo = null
        }
        const zonaIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.zonaIDV,
            nombreCampo: "El zonaIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await eliminarBloqueoCaducado();
        let fechaInicio_ISO = null;
        let fechaFin_ISO = null;
        await obtenerBloqueoPorBloqueoUID(bloqueoUID)

        if (tipoBloqueoIDV !== "permanente" && tipoBloqueoIDV !== "rangoTemporal") {
            const error = "tipoBloqueoIDV solo puede ser permanente o rangoTemporal";
            throw new Error(error);
        }
        if (zonaIDV !== "global" && zonaIDV !== "publica" && zonaIDV !== "privada") {
            const error = "zona solo puede ser global, publico o privada";
            throw new Error(error);
        }

        if (tipoBloqueoIDV === "rangoTemporal") {

            const detallesDelBloquoe = await obtenerBloqueoPorBloqueoUID(bloqueoUID)
            const fechaInicioBloqueo_ISO = detallesDelBloquoe.fechaInicioBloqueo_ISO;
            const fechaFinBloqueo_ISO = detallesDelBloquoe.fechaFinBloqueo_ISO;
            fechaInicio_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: entrada.body.fechaInicio,
                nombreCampo: "La fecha de inicio del bloqueo"
            })
            fechaFin_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: entrada.body.fechaFin,
                nombreCampo: "la fecha de final del bloqueo"
            })
            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: fechaInicio_ISO,
                fechaSalida: fechaFin_ISO,
                tipoVector: "igual"
            })
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const tiempoZH = DateTime.now().setZone(zonaHoraria).startOf('day');
            const fechaFin_TZ_Objeto = DateTime.fromISO(fechaFin_ISO, { zone: zonaHoraria });
            if (tiempoZH > fechaFin_TZ_Objeto) {
                const error = "La fecha de fin del bloqueo no puede ser inferior a la fecha actual, porque estarías creando un bloqueo enteramente en el pasado. Puedes crear un bloqueo que empieza en el pasado, pero debe que acabar en el futuro o en hoy. Los bloqueos que acaban en el pasado son automáticamente borrados por ser bloqueos caducos.";
                throw new Error(error);
            }
        }
        const dataActualizarBloqueoPorBloqueoUID = {
            tipoBloqueoIDV,
            fechaInicio_ISO,
            fechaFin_ISO,
            motivo,
            zonaIDV,
            bloqueoUID
        }
        const bloqueActualizado = await actualizarBloqueoPorBloqueoUID(dataActualizarBloqueoPorBloqueoUID)
        const ok = {
            ok: "Se ha actualizado el bloqueo correctamente",
            bloqueo: bloqueActualizado
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}