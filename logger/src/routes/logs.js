'use strict'

const router = new (require('koa-router'))

const dockerService = require('../dockerService')
const logsStorage = require('../logsStorage')

router.get('/', async ctx => {
  ctx.body = await logsStorage.getLogs()
})

router.get('/:name', async ctx => {
  const {name} = ctx.params
  const containerId = await dockerService.getLoggableContainerIdsByName(name)
  ctx.assert(containerId, 404, `No container named "${name}" found`)

  ctx.body = await logsStorage.getLogs({containerId})
})

router.get('/:name/:type', async ctx => {
  const {name, type} = ctx.params

  ctx.assert(type == 'stdout' || type == 'stderr', 400,
    `invalid type "${type}" - only "stdout" and "stderr" are allowed`
  )

  const containerId = await dockerService.getLoggableContainerIdsByName(name)
  ctx.assert(containerId, 404, `No container named "${name}" found`)

  ctx.body = await logsStorage.getLogs({containerId, type})
})

module.exports = router