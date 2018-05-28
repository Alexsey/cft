'use strict'

const router = new (require('koa-router'))

const dockerService = require('../dockerService')
const logsStorage = require('../logsStorage')

router.get('/:name', async ctx => {
  const {name} = ctx.params
  const containerId = await dockerService.getLoggableContainerIdsByName(name)
  ctx.assert(containerId, 404, `No container named "${name}" found`)
  if (logsStorage.isRecording(containerId))
    return ctx.body =
      `Logs are already recording for container with id "${containerId}"`

  const logsStream = await dockerService.getLogs(containerId)
  logsStorage.recordLogsStream(logsStream, containerId)

  ctx.body = `Starting to record logs of container with id "${containerId}"`
})

module.exports = router