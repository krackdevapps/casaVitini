import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";

import { obtenerBloqueoPorBloqueoUID } from "../../../repositorio/bloqueos/obtenerBloqueoPorBloqueoUID.mjs";
import { actualizarBloqueoPorBloqueoUID } from "../../../repositorio/bloqueos/actualizarBloqueoPorBloqueoUID.mjs";

export const modificarBloqueo = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const bloqueoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.bloqueoUID,
            nombreCampo: "El identificador universal de bloqueoUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })
        const tipoBloqueo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoBloqueo,
            nombreCampo: "El tipoBloqueo",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const motivo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.motivo,
            nombreCampo: "El campo del motivo",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const zona = validadoresCompartidos.tipos.cadena({
            string: entrada.body.zona,
            nombreCampo: "El zona",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        // const validarFechaInicioSuperiorFechaFinal = async (fechaInicio_ISO, fechaFin_ISO) => {
        //     const fechaInicio_Objeto = DateTime.fromISO(fechaInicio_ISO);
        //     const fechaFin_Objeto = DateTime.fromISO(fechaFin_ISO);
        //     if (fechaInicio_Objeto > fechaFin_Objeto) {
        //         const error = "La fecha de inicio del bloqueo no puede ser inferior a la fecha de fin del bloqueo, si puede ser igual para determinar un solo dia";
        //         throw new Error(error);
        //     }
        //     const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        //     const tiempoZH = DateTime.now().setZone(zonaHoraria).startOf('day');
        //     const fechaFin_TZ_Objeto = DateTime.fromISO(fechaFin_ISO, { zone: zonaHoraria });
        //     if (tiempoZH > fechaFin_TZ_Objeto) {
        //         const error = "La fecha de fin del bloqueo no puede ser inferior a la fecha actual porque estarías creando un bloqueo enteramente en el pasado. Puedes crear un bloqueo que empieza en el pasado, pero debe que acabar en el futuro o en hoy. Los bloqueo que acaban en el pasado son automaticamente borrados por ser bloqueos caducos.";
        //         throw new Error(error);
        //     }
        // }
        await eliminarBloqueoCaducado();
        let fechaInicio_ISO = null;
        let fechaFin_ISO = null;
        await obtenerBloqueoPorBloqueoUID(bloqueoUID)
        if (tipoBloqueo === "rangoTemporal") {
            const fechaInicio_ISO = entrada.body.fechaInicio_ISO;
            const fechaFin_ISO = entrada.body.fechaFin_ISO;
            const detallesDelBloquoe = await obtenerBloqueoPorBloqueoUID(bloqueoUID)
            const fechaInicioBloqueo_ISO = detallesDelBloquoe.fechaInicioBloqueo_ISO;
            const fechaFinBloqueo_ISO = detallesDelBloquoe.fechaFinBloqueo_ISO;
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: fechaInicio_ISO,
                    nombreCampo: "La fecha de inicio del bloqueo"
                })
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: fechaFin_ISO,
                    nombreCampo: "la fecha de final del bloqueo"
                })
                await validadoresCompartidos.fechas.validacionVectorial({
                    fechaEntrada_ISO: fechaInicio_ISO,
                    fechaFin_ISO: fechaFin_ISO,
                })
        }
        const dataActualizarBloqueoPorBloqueoUID = [
            tipoBloqueo,
            fechaInicio_ISO,
            fechaFin_ISO,
            motivo,
            zona,
            bloqueoUID
        ];
        await actualizarBloqueoPorBloqueoUID(dataActualizarBloqueoPorBloqueoUID)
        const ok = {
            ok: "Se ha actualizado el bloqueo correctamente"
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}