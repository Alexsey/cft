'use strict'

const router = new (require('koa-router'))

const dockerService = require('../dockerService')
const logsStorage = require('../logsStorage')

router.get('/:name', async ctx => {
  const {name} = ctx.params
  const containerId = await dockerService.getLoggableContainerIdsByName(name)
  ctx.assert(containerId, 404, `No container named "${name}" found`)
  if (logsStorage.isNotRecording(containerId))
    return ctx.body =
      `Logs was not recording for container with id "${containerId}"`

  logsStorage.stopLogsRecording(containerId)

  ctx.body = `Stop recording the container with id ${containerId}`
})

module.exports = router