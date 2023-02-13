import { FastifyInstance } from 'fastify'
import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/hello', async () => {
    // INSERIR
    // const transaction = await knex('transactions')
    //   .insert({
    //     id: crypto.randomUUID(),
    //     title: 'Transação de teste',
    //     amount: 1000,
    //   })
    //   .returning('*')

    // LISTAR TRANSACOES
    // const transaction = await knex('transactions').select('*')

    // LISTAR TRANSACOES ESPECIFICAS
    const transaction = await knex('transactions')
      .where('amount', 1000)
      .select('*')

    return transaction
  })
}
