import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { totalesBasePorRango } from "../../../sistema/contenedorFinanciero/entidades/reserva/totalesBasePorRango.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";


export const precioRangoApartamentos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const fechaEntrada = entrada.body.fechaEntrada;
        const fechaSalida = entrada.body.fechaSalida;
        await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)
        await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)

        const apartamentosIDVArreglo = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentosIDVArreglo,
            nombreCampo: "El apartamentosIDVArreglo",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })

        const metadatos = {
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosIDVArreglo: apartamentosIDVArreglo
        };
        const preciosApartamentosResuelos = await totalesBasePorRango(metadatos);
        const ok = {
            ok: preciosApartamentosResuelos
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}