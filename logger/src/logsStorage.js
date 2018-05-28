'use strict'

const path = require('path')
const fs = require('fs')
const fsp = fs.promises

const fse = require('fs-extra')
const bb = require('bluebird')
const {transform, mapValues, set} = require('lodash')
const splitLogsStream = require('docker-modem').prototype.demuxStream

const logsFolder = process.env.LOGS_FOLDER || '/var/logs'
fse.ensureDirSync(logsFolder)

const currentlyLogging = {}

module.exports = {
  recordLogsStream: (logsStream, containerId) => {
    const outStream = createStreamToLogFile(containerId, 'stdout')
    const errStream = createStreamToLogFile(containerId, 'stderr')

    splitLogsStream(logsStream, outStream, errStream)
    currentlyLogging[containerId] = {outStream, errStream, logsStream}
  },

  stopLogsRecording: containerId => {
    const {outStream, errStream, logsStream} = currentlyLogging[containerId]
    outStream.destroy()
    errStream.destroy()
    logsStream.destroy()
    currentlyLogging[containerId] = undefined
  },

  isRecording: containerId => !!currentlyLogging[containerId],

  isNotRecording: containerId => !currentlyLogging[containerId],

  getLogs: async ({containerId, type} = {}) => {
    if (containerId && type)
      return createStreamFromLogFile(containerId, type)
    if (containerId)
      return getLogsByContainerId(containerId)
    return getAllLogs()
  },
}

function createStreamToLogFile (containerId, type) {
  const logFilePath = getLogFilePath(containerId, type)
  return fs.createWriteStream(logFilePath, {flags: 'a+'})
}

function createStreamFromLogFile (containerId, type) {
  const logFilePath = getLogFilePath(containerId, type)
  return new Promise((res, rej) => {
    const logStream = fs.createReadStream(logFilePath)
    logStream.on('error', e => e.code == 'ENOENT' ? res('') : rej(e))
    logStream.on('open', () => res(logStream))
  })
}

function getLogsByContainerId (containerId) {
  return bb.props({
    stdout: getLogFile(containerId, 'stdout'),
    stderr: getLogFile(containerId, 'stderr'),
  })
}

async function getAllLogs () {
  const logsFilesNames = await fsp.readdir(logsFolder)
  const logsByContainers = transform(logsFilesNames, (logs, logFilename) => {
    const [containerId, type] = logFilename.split('.')
    set(logs, [containerId, type], getLogFile(containerId, type))
  }, {})

  return bb.props(mapValues(logsByContainers, bb.props))
}

async function getLogFile (containerId, type) {
  const filePath = getLogFilePath(containerId, type)
  const file = await fsp.readFile(filePath, 'utf-8').catch(() => '')
  return typeof file == 'string' ? file : '' // bypass new fs-promise API bug
}

function getLogFilePath (containerId, type) {
  return path.join(logsFolder, `${containerId}.${type}.log`)
}