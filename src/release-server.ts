import * as del from 'del';
import config from './.gulpconfig.json' assert { type: 'json' };
import g from 'gulp';

export const cleanServerForRelease = initCleanServer(config.paths.server.release);
export const cleanServerForStaging = initCleanServer(config.paths.server.stage);

export const copyServerForRelease = initServerCopy(config.paths.server.release);
export const copyServerForStaging = initServerCopy(config.paths.server.stage);

export function initCleanServer(destPath: string) {
  return function cleanServer(done: () => void) {
    del.deleteSync([`${destPath}/**`, `!${destPath}/users.json`, `!${destPath}`], {
      force: true,
    });
    done();
  };
}

export function initServerCopy(destPath: string) {
  const dist = config.paths.server.dist;
  const root = config.paths.server.src;
  return function copyServer() {
    return g
      .src([
        `${dist}/**/*.js`,
        `${dist}/**/*.key`,
        `${dist}/**/*.pem`,
        `${root}/config.json`,
        `${root}/package.json`,
        `${root}/package-lock.json`,
        `!${dist}/scratch.js`,
        `!${root}/gulpfile.js`,
      ])
      .pipe(g.dest(destPath));
  };
}
