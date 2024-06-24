import Decimal from 'decimal.js';
import { obtenerSobreControlDeLaNoche } from '../../../../repositorio/reservas/transacciones/sobreControl/obtenerSobreControlDeLaNoche.mjs';
Decimal.set({ precision: 50 });
export const aplicarSobreControl = async (data) => {
    try {
        const netoApartamento = new Decimal(data.netoApartamento)
        const fechaNoche = data.fechaNoche
        const apartamentoIDV = data.apartamentoIDV
        const reservaUID = data.reservaUID
        const sobreControl = await obtenerSobreControlDeLaNoche({
            reservaUID,
            fechaNoche,
            apartamentoIDV
        })

        if (!sobreControl) {
            return netoApartamento
        }
        const operacion = sobreControl.detallesSobreControl.operacion
        const valor = sobreControl.detallesSobreControl.valor

        if (operacion === "aumentarPorPorcentaje") {
            const calculo = netoApartamento.times(valor).dividedBy(100)
            const netoSobreControlado = netoApartamento.plus(calculo)
            return netoSobreControlado
        } else if (operacion === "reducirPorPorcentaje") {
            const calculo = netoApartamento.times(valor).dividedBy(100)
            const netoSobreControlado = netoApartamento.minus(calculo)
            if (netoSobreControlado.isNegative()) {
                return "0.00"
            } else {
                return netoSobreControlado
            }
        } else if (operacion === "aumentarPorCantidadFija") {
            const netoSobreControlado = netoApartamento.plus(valor)
            return netoSobreControlado
        } else if (operacion === "reducirPorCantidadFila") {
            const netoSobreControlado = netoApartamento.minus(valor)
            if (netoSobreControlado.isNegative()) {
                return "0.00"
            } else {
                return netoSobreControlado
            }
        } else if (operacion === "establecerCantidad") {
            return valor
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
