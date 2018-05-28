'use strict'

const interval = 1000

let logsPrefix
let intervalId

module.exports = {
  init,
  start,
  stop,
}

function start () {
  if (intervalId) return 'already running'

  intervalId = setInterval(() => {
    console.log(genStdOutMsg())
    console.error(getStdErrMsg())
  }, interval)

  return 'log start'
}

function stop () {
  if (!intervalId) return 'was not running'

  clearInterval(intervalId)
  intervalId = null

  return 'log stop'
}

function init (prefix) {
  logsPrefix = prefix && !prefix.endsWith(' ') ? prefix + ' ' : ''
}

function genStdOutMsg () {
  return `${logsPrefix}stdout ${new Date}`
}

function getStdErrMsg () {
  return `${logsPrefix}stderr ${new Date}`
}