
import { describe, expect, test } from '@jest/globals';
import { estadoDeAcceso } from '../../../logica/repositorio/globales/estadoDeAcceso.mjs';
import { campoDeTransaccion } from '../../../logica/repositorio/globales/campoDeTransaccion.mjs';

describe('check and transaccion', () => {
    test('flow transaccion', async () => {
        await campoDeTransaccion("iniciar")
        await campoDeTransaccion("confirmar")
        await campoDeTransaccion("cancelar")
    })
    test('check', async () => {
        await estadoDeAcceso()
    })
})