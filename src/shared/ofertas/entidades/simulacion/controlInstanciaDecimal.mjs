import Decimal from "decimal.js"
export const controlInstanciaDecimal = (data) => {
    if (!(data instanceof Decimal)) {
        return new Decimal(data)
    } else {
        return data
    }
}
