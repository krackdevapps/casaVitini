import Decimal from "decimal.js";



const sumaConPrecision = (numero1, numero2, precision) => {
    // Crear instancias de Decimal con la precisión especificada
    const decimal1 = new Decimal(numero1.toString());
    const decimal2 = new Decimal(numero2.toString());

    // Configurar la precisión
    Decimal.set({ precision: precision });

    // Realizar la suma
    const resultado = decimal1.plus(decimal2);

    // Redondear el resultado a la precisión especificada
    return resultado.toFixed();
};



const resultadoSuma = sumaConPrecision(0.1, 0.2, 5);
