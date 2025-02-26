
import { describe, expect, test } from '@jest/globals';
import { estadoDeAcceso } from '../../../src/infraestructure/repository/globales/estadoDeAcceso.mjs';
import { campoDeTransaccion } from '../../../src/infraestructure/repository/globales/campoDeTransaccion.mjs';

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