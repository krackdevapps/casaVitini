import { utilidades } from "../../../shared/utilidades.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";


export const calculadora = (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })
        const numero1 = entrada.body.numero1;
        const numero2 = entrada.body.numero2;
        const operador = entrada.body.operador;
        const validarNumero = (numero) => {
            const regex = /^-?\d+(\.\d{1,2})?$/;
            return regex.test(numero);
        };
        const validarOperador = (operador) => {
            const operadoresValidos = ['+', '-', '*', '/', '%'];
            return operadoresValidos.includes(operador);
        };
        if (!validarNumero(numero1) || !validarNumero(numero2)) {
            const error = 'Entrada no válida. Por favor, ingrese números enteros o con hasta dos decimales.';
            throw new Error(error);
        }
        if (!validarOperador(operador)) {
            const error = 'Operador no válido. Los operadores válidos son +, -, *, /.';
            throw new Error(error);
        }
        const resultado = utilidades.calculadora(numero1, numero2, operador);
        const ok = {
            ok: resultado
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}