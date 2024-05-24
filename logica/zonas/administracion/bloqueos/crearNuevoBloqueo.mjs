import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { insertarNuevoBloqueo } from "../../../repositorio/bloqueos/insertarNuevoBloqueo.mjs";

export const crearNuevoBloqueo = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
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

        const zonaUI = validadoresCompartidos.tipos.cadena({
            string: entrada.body.zonaUI,
            nombreCampo: "El zonaUI",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        await eliminarBloqueoCaducado()
        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        if (!configuracionApartamento.apartamento) {
            const error = "No existe el identificador del apartamento";
            throw new Error(error);
        }
        if (tipoBloqueo !== "permanente" && tipoBloqueo !== "rangoTemporal") {
            const error = "tipoBloqueo solo puede ser permanente o rangoTemporal";
            throw new Error(error);
        }
        if (zonaUI !== "global" && zonaUI !== "publico" && zonaUI !== "privado") {
            const error = "zona solo puede ser global, publico o privado";
            throw new Error(error);
        }
        const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;
        let fechaInicio_ISO = null;
        let fechaFin_ISO = null;
        if (tipoBloqueo === "rangoTemporal") {
            const fechaInicio = entrada.body.fechaInicio;
            const fechaFin = entrada.body.fechaFin;
            fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio)).fecha_ISO;
            fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin)).fecha_ISO;
            const fechaInicio_Objeto = DateTime.fromISO(fechaInicio_ISO);
            const fechaFin_Objeto = DateTime.fromISO(fechaFin_ISO);
            if (fechaInicio_Objeto > fechaFin_Objeto) {
                const error = "La fecha de inicio del bloqueo no puede ser inferior a la fecha de fin del bloqueo, si puede ser igual para determinar un solo día.";
                throw new Error(error);
            }
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const tiempoZH = DateTime.now().setZone(zonaHoraria).startOf('day');
            const fechaFin_TZ_Objeto = DateTime.fromISO(fechaFin_ISO, { zone: zonaHoraria });
            if (tiempoZH > fechaFin_TZ_Objeto) {
                const error = "La fecha de fin del bloqueo no puede ser inferior a la fecha actual porque estarías creando un bloqueo enteramente en el pasado. Puedes crear un bloqueo que empieza en el pasado, pero debe que acabar en el futuro o en hoy. Los bloqueo que acaban en el pasado son automaticamente borrados por ser bloqueos caducos.";
                throw new Error(error);
            }
        }
        if (motivo) {
            if (!filtroTextoSimple.test(motivo)) {
                const error = "Por temas de seguridad ahora mismo en el campo motivo, solo pueden aceptarse minúsculas, mayúsculas, espacio y números. Mas adelante se aceptarán todos los caracteres.";
                throw new Error(error);
            }
        } else {
            motivo = null;
        }

        const datosNuevoBloqueo = [
            apartamentoIDV,
            tipoBloqueo,
            fechaInicio_ISO,
            fechaFin_ISO,
            motivo,
            zonaUI
        ];

        const nuevoBloquoe = await insertarNuevoBloqueo(datosNuevoBloqueo)

        const nuevoUIDBloqueo = nuevoBloquoe.resuelve;
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