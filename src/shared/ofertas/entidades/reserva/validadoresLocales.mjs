import Decimal from "decimal.js";

export const validadoresLocales = {
    numero: (numero) => {
        try {
            validadoresCompartidos.tipos.numero({
                number: numero,
                nombreCampo: "El campo numero",
                filtro: "numeroSimple",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                sePermitenNegativos: "no"
            })
        } catch (errorCapturado) {
            throw errorCapturado
        }
    },
    simboloNumero: (simboloNumero) => {
        try {
            if (!simboloNumero || (simboloNumero !== "numeroExacto" && simboloNumero !== "aPartirDe")) {
                const error = "El campo simboloNumero debe de ser un número entero y positivo.";
                throw new Error(error);
            }
        } catch (errorCapturado) {
            throw errorCapturado
        }
    },
    tipoDescuento: (tipoDescuento) => {
        try {
            if (!tipoDescuento || (tipoDescuento !== "cantidadFija" && tipoDescuento !== "porcentaje")) {
                const error = `El tipo de descuento solo puede ser cantidadFija, porcentable o precioEstablecido`;
                throw new Error(error);
            }
        } catch (errorCapturado) {
            throw errorCapturado
        }
    },
    contextoAplicacion: (contextoAplicacion) => {
        try {
            if (!contextoAplicacion || (contextoAplicacion !== "totalNetoReserva" && contextoAplicacion !== "totalNetoApartamentoDedicado")) {
                const error = `El campo contexto de aplicación solo puede ser, totalNetoReserva, totalNetoApartamentoDedicado`;
                throw new Error(error);
            }
        } catch (errorCapturado) {
            throw errorCapturado
        }

    },
    controlLimitePorcentaje: (tipoDescuento, cantidad) => {
        try {
            if (tipoDescuento === "porcentaje" && new Decimal(cantidad).greaterThan(100)) {
                const error = "Cuidado! No se puede aceptar un porcentaje superior al 100% porque  sino la oferta, podría generar números negativos.";
                throw new Error(error);
            }
        } catch (errorCapturado) {
            throw errorCapturado
        }
    }
};