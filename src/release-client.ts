import gulp from 'gulp'
import { build } from 'vite'
import config from './.gulpconfig.json' assert { type: 'json' }
import * as del from 'del'

export function compileClient() {
  return build({
    root: config.paths.client.src,
    mode: 'production',
  })
}

export const copyClientForRelease = initCopyClient(config.paths.client.release)
export const copyClientForStaging = initCopyClient(config.paths.client.stage)

export const cleanClientForRelease = initCleanClient(config.paths.client.release)
export const cleanClientForStaging = initCleanClient(config.paths.client.stage)

export function initCopyClient(destPath: string) {
  return function copyClient() {
    return gulp.src(`${config.paths.client.dist}/**`).pipe(gulp.dest(`${destPath}`))
  }
}

export function initCleanClient(destPath: string) {
  return function cleanClient(done: () => void) {
    del.deleteSync(
      [
        `${destPath}/**`,
        `!${destPath}`,
        `!${destPath}/version.txt`,
        `!${destPath}/_data`,
      ],
      { force: true }
    )
    done()
  }
}
