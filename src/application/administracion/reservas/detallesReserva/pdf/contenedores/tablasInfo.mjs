export const tablasInfo = (data) => {


    try {
        const doc = data.doc



        const mensajes = [
            {
                text: 'Este documento es solo un resumen de su reserva con la información global de la reserva y los totales. Si desea un desglose detallado, puede acceder a casavitini.com con su cuenta de usuario. Puede registrar su cuenta gratuitamente en https://casavitini.com/micasa/crear_nueva_cuenta. Recuerde usar la misma dirección de correo electrónico que utilizó para confirmar su reserva. Puede encontrar la dirección de correo electrónico que se usó para hacer la reserva en la parte superior derecha de este documento, justo al lado del código QR.',
            },
            {
                text: 'Si necesita ponerse en contacto con nosotros, puede encontrar mas métodos de contacto en https://casavitini.com/contacto.',
            },
            {
                text: `Existen distintos formatos para expresar fechas por escrito. Dependiendo del país, el formato nacional para representar fechas puede variar con respecto al de otros países. Debido al uso de distintos formatos nacionales para expresar fechas, este documento presenta las fechas en el estándar mundial ISO 8601, definido por la Organización Internacional de Normalización (ISO). Este estándar está diseñado para representar las fechas de manera internacional. Utiliza la estructura YYYY-MM-DD, donde YYYY representa el año, MM el mes y DD el día. Por ejemplo, la fecha 1234-02-01 hace referencia al 1 de febrero de 1234. Este formato es el que se utiliza en este documento para expresar las fechas de entrada y salida. Si necesita más información sobre este formato o desea conocer otros detalles, puede acceder a la web oficial del estándar o a su ficha en Wikipedia. A continuación, se detallan las URL de ambas:
                
                https://www.iso.org/iso-8601-date-and-time-format.html
                https://es.wikipedia.org/wiki/ISO_8601`,
            },
            {
                text: 'Este documento es meramente informativo. Para realizar el check-in, es necesario presentar algún documento identificativo, como un pasaporte o un documento nacional de identidad.',
            },
            {
                text: 'Puede usar el código QR para ir a los detalles de esta reserva de una manera fácil y cómoda.',
            },
            {
                text: `Puedes ver nuestro centro de políticas en 
                casavitini.com/politicas
        
                Puede ir directamente a nuestras políticas de cancelación en
                casavitini.com/politicas/cancelacion
        
                Puede ir directamente a nuestras políticas de privacidad en
                casavitini.com/politicas/privacidad`,
            }
        ]

        mensajes.forEach(m => {
            m.style = "textoSimple"
            doc.push(m)

        });
    } catch (error) {
        throw error
    }


}