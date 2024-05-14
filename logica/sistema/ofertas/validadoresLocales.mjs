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
        } catch (error) {
            throw error
        }
    },
    simboloNumero: (simboloNumero) => {
        try {
            if (!simboloNumero || (simboloNumero !== "numeroExacto" && simboloNumero !== "aPartirDe")) {
                const error = "El campo simboloNumero debe de ser un numer entero y positivo";
                throw new Error(error);
            }
        } catch (error) {
            throw error
        }
    },
    tipoDescuento: (tipoDescuento) => {
        try {
            if (!tipoDescuento || (tipoDescuento !== "cantidadFija" && tipoDescuento !== "porcentaje")) {
                const error = `El tipo de descuento solo puede ser cantidadFija, porcentable o precioEstablecido`;
                throw new Error(error);
            }
        } catch (error) {
            throw error
        }
    },
    contextoAplicacion: (contextoAplicacion) => {
        try {
            if (!contextoAplicacion || (contextoAplicacion !== "totalNetoReserva" && contextoAplicacion !== "totalNetoApartamentoDedicado")) {
                const error = `El campo contexto de aplicación solo puede ser, totalNetoReserva, totalNetoApartamentoDedicado`;
                throw new Error(error);
            }
        } catch (error) {
            throw error
        }

    },
    controlLimitePorcentaje: (tipoDescuento, cantidad) => {
        try {
            if (tipoDescuento === "porcentaje" && new Decimal(cantidad).greaterThan(100)) {
                const error = "Cuidado! No se puede acepatar un porcentaje superior a 100% por que sino la oferta podria generar numeros negativos.";
                throw new Error(error);
            }
        } catch (error) {
            throw error
        }
    }
};