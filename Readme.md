## Demo

To start the demo run `npm start`. It would use `docker-compose` to
start two `logsGenerator` containers that may generate logs and one
`logger` container that may record logs of other containers to files.
`logsGenerator` containers are setup to log messages with different
prefixes so they can be easily distinguished

All container are HTTP servers so control by logs generation and
recording may be done with any HTTP client. All routes are GET so even
browser would be quite suitable. In case some of IntelliJ IDEs are used
the `api.http` can be used directly. Otherwise, URLs from there may be
copied to the browser


To clean up the docker images and containers after the
demo use `npm run clean`

This can be the sequence of calls to see the app in action

http://localhost:8080/start/log-gen-1
// command `logger` to record logs of First `logsGenerator`

http://localhost:8081/start
// command First `logsGenerator` to start to emit logs

wait for 1-2 seconds

http://localhost:8081/stop
// command First `logsGenerator` to stop to emit logs

http://localhost:8080/logs
// see all the saved logs of `logsGenerator`

http://localhost:8082/start
// command Second `logsGenerator` to start to emit logs

wait for 1-2 seconds

http://localhost:8082/stop
// command Second `logsGenerator` to stop to emit logs

http://localhost:8080/logs
// see that Second `logsGenerator` logs are not recorded

http://localhost:8080/start/log-gen-2
// command `logger` to record logs of Second `logsGenerator`

http://localhost:8080/stop/log-gen-1
// command `logger` to stop the recording of logs of First `logsGenerator`

http://localhost:8081/start
// command First `logsGenerator` to start to emit logs

http://localhost:8082/start
// command Second `logsGenerator` to start to emit logs

wait for 1-2 seconds

http://localhost:8081/stop
// command First `logsGenerator` to stop to emit logs

http://localhost:8082/stop
// command Second `logsGenerator` to stop to emit logs

http://localhost:8080/logs
// see that Second `logsGenerator` was recorded and First `logsGenerator` was not

http://localhost:8080/logs/log-gen-1
// see the logs of only First `logsGenerator`

http://localhost:8080/logs/log-gen-2
// see the logs of only Second `logsGenerator`

http://localhost:8080/logs/log-gen-1/stdout
// see only stdout of First `logsGenerator`

http://localhost:8080/logs/log-gen-1/stderr
// see only stderr of First `logsGenerator`

The last two requests are streaming the response so it may not be
suitable to use them in a browser

## Structure

### Logs Generator
May generate logs by posting to stdout and stderr

Each log is a message to stdout and stderr

Logs are emitted one per second

Each message is a prefix + stream type + current time. Where
* prefix is a value of `LOGS_PREFIX` env var
* stream type is "stdout" or "stderr"
* current time in full ISO format

`logger` cannot record logs of itself or another `logger`

##### Env vars configuration

`LOGS_PREFIX` - specifies the prefix of the logs

##### API

* `GET /start` - start to emit logs
* `GET /stop` - stop to emit logs

### Logger

May record logs of other containers

##### Env vars Configuration
* `LOGS_FOLDER` - specified the location of the logs files
* `STRICT` - if "true" - will record only logs that was
  emitted while the container explicetly listened. Otherwise, each time
  on `/start` will pull all available logs

##### API
It is a server that may receive three comands
* `GET /start/:name` - start to listen to container
* `GET /end/:name` - stop to listen to container
* `GET /logs/:name/:type` - get logs. `name` and `type` are optional

`name` is a container `Id` (long or short), some of it's `Names`
or `service` name

`type` is "stdout" or "stderr"

## Notes

* `Logger` may return logs in different for - with `name` and `type` it
will stream the logs and otherwise it will return a JSON string. This
means that usage without `name` and `type` is just for demo - it will
consume RAM in a size of the response. Response for request with
`name` and `type` provided is RAM effective and only it may be
considered as a fully correct solution
* `npm start` is setting an env var `COMPOSE_CONVERT_WINDOWS_PATHS` to
`1` because the current version of Docker has a
[bug under Windows](https://github.com/docker/for-win/issues/1829)
that is not allowed to pass a `docker.sock` to Linux container. It
should not affect Os X or Linux host
* Docker events was not used because the selected strategy of deciding
which containers to listen on does not require them. In any case, their
usage is trivial with `docker-events` like in example or with `dockerode`
`.getEvents()`. Hope it would not be an issue
* About "You should make sure you get all logs from the container". If
it was about getting "stdout" and "stderr" - it's done. If it was about
getting as much logs as possible than not setting `logger` env var
`STRICT` to "true" would do that