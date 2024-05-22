import { obtenerApartamentosDisponiblesConfigurados } from "../../../repositorio/arquitectura/obtenerApartamentosDisponiblesConfigurados.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const apartamentosDisponiblesConfigurados = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamentosDisponiblesConfigurados_ = await obtenerApartamentosDisponiblesConfigurados()

        if (apartamentosDisponiblesConfigurados_.length === 0) {
            const error = "No hay ningun apartamento disponible configurado";
            throw new Error(error);
        }
        const ok = {
            ok: apartamentosDisponiblesConfigurados_
        }
        return ok
    } catch (errorCatpurado) {
        throw errorFinal
    }
}