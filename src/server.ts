import fastify from 'fastify'
// import crypto from 'node:crypto'
import { knex } from './database'
import { env } from './env'

const app = fastify()

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

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
