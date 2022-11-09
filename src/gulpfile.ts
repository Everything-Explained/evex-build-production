import { existsSync } from 'fs';
import { resolve as pathResolve } from 'path';
import _config from './.gulpconfig.json';
import z, { ZodError } from 'zod';
import g from 'gulp';
import {
  cleanClientForRelease,
  cleanClientForStaging,
  compileClient,
  copyClientForRelease,
  copyClientForStaging,
} from './release-client.js';
import {
  copyServerForRelease,
  cleanServerForRelease,
  cleanServerForStaging,
  copyServerForStaging,
} from './release-server.js';
import * as CMS from '@ev_ex/web-cms-build';

/** Console Colors */
const c = {
  r: '\x1b[31m',
  y: '\x1b[93m',
  reset: '\x1b[0m',
};

const Config = z.object({
  paths: z.object({
    client: z.object({
      src: z.string(),
      dist: z.string(),
      stage: z.string(),
      release: z.string(),
    }),
    server: z.object({
      src: z.string(),
      dist: z.string(),
      stage: z.string(),
      release: z.string(),
    }),
  }),
});

const validConfig = init();
const clientReleasePath = validConfig.paths.client.release;
const clientStagingPath = validConfig.paths.client.stage;
const buildCMS = (rootPath: string, dataPath: string) => (done: () => void) =>
  CMS.build(rootPath, dataPath, done);

g.task(
  'release-client',
  g.series(
    compileClient,
    cleanClientForRelease,
    copyClientForRelease,
    buildCMS(clientReleasePath, `${clientReleasePath}/_data`)
  )
);
g.task(
  'stage-client',
  g.series(
    compileClient,
    cleanClientForStaging,
    copyClientForStaging,
    buildCMS(clientStagingPath, `${clientStagingPath}/_data`)
  )
);

g.task('release-server', g.series(cleanServerForRelease, copyServerForRelease));
g.task('stage-server', g.series(cleanServerForStaging, copyServerForStaging));
g.task('hello', (done) => {
  done();
});

function init() {
  try {
    const parsedConfig = Config.parse(_config);
    validatePaths(parsedConfig);
    return parsedConfig;
  } catch (e) {
    console.error(`${c.r}\n[CONFIG ERROR]${c.reset}`);
    if (e instanceof ZodError) {
      handleConfigError(e);
      process.exit(1);
    }
    console.error(c.y, e, c.reset);
    process.exit(1);
  }
}

function handleConfigError(e: ZodError) {
  console.error(
    `${c.y}${e.issues[0].path.join('.')} is ${e.issues[0].message}${c.reset}`
  );
}

function validatePaths(config: typeof _config) {
  let name: keyof typeof config.paths;
  let path: keyof typeof config.paths[typeof name];

  for (name in config.paths) {
    for (path in config.paths[name]) {
      const resolvedPath = pathResolve(config.paths[name][path]);
      if (!existsSync(resolvedPath)) {
        throw Error(`Folder Not Found: (paths.${name}.${path})::"${resolvedPath}"`);
      }
    }
  }
}
