'use strict'

const os = require('os')
const shortContainerId = os.hostname()

const _ = require('lodash')
const Docker = require('dockerode')

const docker = new Docker({socketPath: '/var/run/docker.sock'})

module.exports = {
  getLogs: containerId => {
    const container = docker.getContainer(containerId)
    const since = process.env.STRICT == "true" ? Date.now() / 1000 | 0 : 0
    return container.logs({
      follow: true, stdout: true, stderr: true, since
    })
  },

  getLoggableContainerIdsByName: async name => {
    const loggableContainersData = await getLoggableContainersData()
    return findContainerIdByName(loggableContainersData, name)
  }
}

async function getLoggableContainersData () {
  const containersData = await docker.listContainers()
  const loggerContainerNames = containersData.find(({Id}) =>
    Id.startsWith(shortContainerId)
  ).Names

  return containersData.filter(({Names}) =>
    _(Names).intersection(loggerContainerNames).isEmpty()
  )
}

function findContainerIdByName (containersData, name) {
  const data = findContainerDataByName(containersData, name)
  return data && data.Id
}

function findContainerDataByName (containersData, name) {
  return containersData.find(({
      Id: id,
      Names: names,
      Labels: {
        'com.docker.compose.service': service
      } = {}
    } = {}
    ) =>
    id.startsWith(name) || service == name || names.includes(name)
  )
}