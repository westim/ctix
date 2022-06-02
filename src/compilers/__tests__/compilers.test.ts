import getExportedName from '@compilers/getExportedName';
import getExportInfo from '@compilers/getExportInfo';
import getExportInfos from '@compilers/getExportInfos';
import { TOptionWithResolvedProject } from '@configs/interfaces/IOption';
import getIgnoreConfigContents from '@ignores/getIgnoreConfigContents';
import getIgnoreConfigFiles from '@ignores/getIgnoreConfigFiles';
import * as env from '@testenv/env';
import { getTestValue, posixJoin } from '@tools/misc';
import consola, { LogLevel } from 'consola';
import fastGlob from 'fast-glob';
import { isEmpty, populate } from 'my-easy-fp';
import { getDirname, replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const share: { projectPath: string; project: tsm.Project } = {} as any;

beforeAll(() => {
  consola.level = LogLevel.Debug;
  share.projectPath = replaceSepToPosix(path.join(env.examplePath, 'tsconfig.json'));
  share.project = new tsm.Project({ tsConfigFilePath: share.projectPath });
});

test('c001-getExportedName', async () => {
  const cases = populate(9, true).map((index) => `case${`${index}`.padStart(2, '0')}.ts`);
  const sourceFiles = cases.map((caseFile) =>
    share.project.getSourceFileOrThrow(path.join(env.exampleType05Path, caseFile)),
  );

  const names = sourceFiles.map((sourceFile) => {
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    const defaultExporteddeclarations = exportedDeclarations.get('default');

    if (isEmpty(defaultExporteddeclarations)) {
      throw new Error('default export not found!');
    }

    consola.debug('length: ', defaultExporteddeclarations.length);

    const [defaultExporteddeclaration] = defaultExporteddeclarations;
    return getExportedName(defaultExporteddeclaration);
  });

  const expectation = [
    'case01',
    'case02',
    'Case03',
    'Case04',
    'TTypeAliasName',
    'IInterfaceDeclaration',
    'ClassDeclaration',
    'Case08',
    'EN_CASE09_DEFAULT_EXPORT',
  ];

  names.sort();
  expectation.sort();

  consola.debug(names);

  expect(names).toEqual(expectation);
});

test('c002-getFileExportInfo', async () => {
  // project://example/type04/fast-maker/ChildlikeCls.ts
  const sourceFilePath = replaceSepToPosix(
    path.join(env.exampleType04Path, 'fast-maker\\ChildlikeCls.ts'),
  );

  const sourceFile = share.project.getSourceFileOrThrow(sourceFilePath);
  const result = await getExportInfo(sourceFile, env.option, { [sourceFilePath]: ['name'] });

  const expectation = {
    resolvedFilePath: posixJoin(env.exampleType04Path, 'fast-maker\\ChildlikeCls.ts'),
    resolvedDirPath: await getDirname(
      posixJoin(env.exampleType04Path, 'fast-maker\\ChildlikeCls.ts'),
    ),
    relativeFilePath: replaceSepToPosix(
      path.relative(
        env.examplePath,
        posixJoin(env.exampleType04Path, 'fast-maker\\ChildlikeCls.ts'),
      ),
    ),
    depth: 4,
    starExported: false,
    defaultExport: { identifier: 'ChildlikeCls' },
    namedExports: [{ identifier: 'ChildlikeCls' }, { identifier: 'greeting' }],
  };

  consola.debug(result);

  expect(getTestValue(result)).toEqual(expectation);
});

test('c003-getFileExportInfo', async () => {
  // project://example/type04/fast-maker/ChildlikeCls.ts
  // example\type03\popcorn\lawyer\appliance\bomb.ts
  const sourceFilePath = posixJoin(
    env.exampleType03Path,
    'popcorn',
    'lawyer',
    'appliance',
    'bomb.ts',
  );

  const option: TOptionWithResolvedProject = {
    ...env.option,
    mode: 'create' as const,
    skipEmptyDir: false,
    keepFileExt: false,
    topDirDepth: 0,
    topDirs: [env.exampleType03Path],
  };

  const sourceFile = share.project.getSourceFileOrThrow(sourceFilePath);
  const result = await getExportInfo(sourceFile, option, { [sourceFilePath]: ['name'] });

  const expectation = {
    resolvedFilePath: posixJoin(env.exampleType03Path, 'popcorn', 'lawyer', 'appliance', 'bomb.ts'),
    resolvedDirPath: await getDirname(
      posixJoin(env.exampleType03Path, 'popcorn', 'lawyer', 'appliance', 'bomb.ts'),
    ),
    relativeFilePath: replaceSepToPosix(
      path.relative(
        env.examplePath,
        posixJoin(env.exampleType03Path, 'popcorn', 'lawyer', 'appliance', 'bomb.ts'),
      ),
    ),
    depth: 4,
    starExported: false,
    defaultExport: { identifier: 'bomb' },
    namedExports: [{ identifier: 'bomb' }],
  };

  consola.debug(getTestValue(result));

  expect(getTestValue(result)).toEqual(expectation);
});

test('c004-getExportInfos-not-ignore', async () => {
  const expectFileName = expect
    .getState()
    .currentTestName.replace(/^([cC][0-9]+)(-.+)/, 'expect$2.ts');

  const files = await fastGlob(
    [
      replaceSepToPosix(path.join(env.exampleType01Path, '**', '*')),
      replaceSepToPosix(path.join(env.exampleType02Path, '**', '*')),
      replaceSepToPosix(path.join(env.exampleType04Path, '**', '*')),
      replaceSepToPosix(path.join(env.exampleType05Path, '**', '*')),
    ],
    { cwd: replaceSepToPosix(env.examplePath) },
  );

  const ignores = files.reduce<Record<string, string | string[]>>((aggregation, file) => {
    return { ...aggregation, [file]: '*' };
  }, {});

  const option: TOptionWithResolvedProject = {
    ...env.option,
    mode: 'create' as const,
    skipEmptyDir: false,
    keepFileExt: false,
    topDirDepth: 0,
    output: replaceSepToPosix(env.exampleType03Path),
    topDirs: [replaceSepToPosix(env.exampleType03Path)],
  };

  const result = await getExportInfos(share.project, option, ignores);
  const expectation = await import(path.join(__dirname, 'expects', expectFileName));

  expect(getTestValue(result)).toEqual(expectation.default);
});

test('c005-getExportInfos-partial-ignore', async () => {
  const expectFileName = expect
    .getState()
    .currentTestName.replace(/^([cC][0-9]+)(-.+)/, 'expect$2.ts');

  const files = await fastGlob(
    [
      replaceSepToPosix(path.join(env.exampleType01Path, '**', '*')),
      replaceSepToPosix(path.join(env.exampleType02Path, '**', '*')),
      replaceSepToPosix(path.join(env.exampleType03Path, '**', '*')),
      replaceSepToPosix(path.join(env.exampleType05Path, '**', '*')),
    ],
    { cwd: replaceSepToPosix(env.examplePath) },
  );

  const ignoreFiles = await getIgnoreConfigFiles(env.exampleType04Path);
  const ignoreContents = await getIgnoreConfigContents({
    cwd: env.exampleType04Path,
    ...ignoreFiles,
  });

  const ignores = files.reduce<Record<string, string | string[]>>((aggregation, file) => {
    return { ...aggregation, [file]: '*', ...ignoreContents };
  }, {});

  const option: TOptionWithResolvedProject = {
    ...env.option,
    mode: 'create' as const,
    skipEmptyDir: false,
    keepFileExt: false,
    topDirDepth: 0,
    output: replaceSepToPosix(env.exampleType04Path),
    topDirs: [replaceSepToPosix(env.exampleType04Path)],
  };

  const result = await getExportInfos(share.project, option, ignores);
  const expectation = await import(path.join(__dirname, 'expects', expectFileName));
  const refined = getTestValue(result);

  expect(refined).toEqual(expectation.default);
});