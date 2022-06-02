import getExportInfos from '@compilers/getExportInfos';
import { TOptionWithResolvedProject } from '@configs/interfaces/IOption';
import getDecendentExportInfo from '@modules/getDecendentExportInfo';
import getDirPaths from '@modules/getDirPaths';
import getFilePathOnIndex from '@modules/getFilePathOnIndex';
import mergeCreateIndexInfo from '@modules/mergeCreateIndexInfo';
import * as env from '@testenv/env';
import { posixJoin } from '@tools/misc';
import validateExportDuplication from '@validations/validateExportDuplication';
import validateFileNameDuplication from '@validations/validateFileNameDuplication';
import consola, { LogLevel } from 'consola';
import fastGlob from 'fast-glob';
import { isFalse } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const share: { projectPath: string; project: tsm.Project } = {} as any;

beforeAll(() => {
  consola.level = LogLevel.Debug;
  share.projectPath = posixJoin(env.examplePath, 'tsconfig.json');
  share.project = new tsm.Project({ tsConfigFilePath: share.projectPath });
});

test('c001-getDirPaths', async () => {
  const expectFileName = expect
    .getState()
    .currentTestName.replace(/^([cC][0-9]+)(-.+)/, 'expect$2.ts');

  const files = await fastGlob(
    [
      posixJoin(env.exampleType01Path, '**', '*'),
      posixJoin(env.exampleType02Path, '**', '*'),
      posixJoin(env.exampleType04Path, '**', '*'),
      posixJoin(env.exampleType05Path, '**', '*'),
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
    topDirs: [env.exampleType03Path],
  };

  const exportInfos = await getExportInfos(share.project, option, ignores);
  const exportDuplicationValidateResult = validateExportDuplication(exportInfos);
  const validateResult = validateFileNameDuplication(
    exportInfos.filter((exportInfo) =>
      isFalse(exportDuplicationValidateResult.filePaths.includes(exportInfo.resolvedFilePath)),
    ),
    option,
  );
  const validExportInfos = exportInfos.filter(
    (exportInfo) =>
      isFalse(validateResult.filePaths.includes(exportInfo.resolvedFilePath)) &&
      isFalse(exportDuplicationValidateResult.filePaths.includes(exportInfo.resolvedFilePath)),
  );

  const dirPaths = await getDirPaths(validExportInfos, option);
  const expectation = await import(path.join(__dirname, 'expects', expectFileName));

  expect(dirPaths).toEqual(expectation.default);
});

test('c002-getFilePathOnIndex', async () => {
  const case01 = posixJoin(env.exampleType04Path, 'fast-maker', 'carpenter', 'DiscussionCls.ts');

  const filePathCase01 = getFilePathOnIndex(case01, { ...env.option, mode: 'create' });
  const filePathCase02 = getFilePathOnIndex(case01, {
    ...env.option,
    mode: 'create',
    keepFileExt: true,
  });

  const option: TOptionWithResolvedProject = {
    ...env.option,
    mode: 'single' as const,
    skipEmptyDir: false,
    keepFileExt: false,
    topDirDepth: 0,
    topDirs: [env.exampleType04Path],
  };

  const filePathCase03 = getFilePathOnIndex(
    case01,
    option,
    replaceSepToPosix(env.exampleType04Path),
  );
  const filePathCase04 = getFilePathOnIndex(
    case01,
    { ...option, keepFileExt: true },
    replaceSepToPosix(env.exampleType04Path),
  );

  const expectation = [
    "'./DiscussionCls'",
    "'./DiscussionCls.ts'",
    "'./fast-maker/carpenter/DiscussionCls'",
    "'./fast-maker/carpenter/DiscussionCls.ts'",
  ].sort();

  const result = [filePathCase01, filePathCase02, filePathCase03, filePathCase04].sort();
  consola.debug(filePathCase01, filePathCase02, filePathCase03, filePathCase04);

  expect(result).toEqual(expectation);
});

test('c003-getDecendentExportInfo', async () => {
  const expectFileName = expect
    .getState()
    .currentTestName.replace(/^([cC][0-9]+)(-.+)/, 'expect$2.ts');

  const files = await fastGlob(
    [
      posixJoin(env.exampleType01Path, '**', '*'),
      posixJoin(env.exampleType02Path, '**', '*'),
      posixJoin(env.exampleType04Path, '**', '*'),
      posixJoin(env.exampleType05Path, '**', '*'),
    ],
    { cwd: replaceSepToPosix(env.examplePath) },
  );

  const option: TOptionWithResolvedProject = {
    ...env.option,
    mode: 'create' as const,
    skipEmptyDir: false,
    keepFileExt: false,
    topDirDepth: 0,
    topDirs: [env.exampleType03Path],
  };

  const ignores = files.reduce<Record<string, string | string[]>>((aggregation, file) => {
    return { ...aggregation, [file]: '*' };
  }, {});

  const exportInfos = await getExportInfos(share.project, option, ignores);
  const exportDuplicationValidateResult = validateExportDuplication(exportInfos);
  const validateResult = validateFileNameDuplication(
    exportInfos.filter((exportInfo) =>
      isFalse(exportDuplicationValidateResult.filePaths.includes(exportInfo.resolvedFilePath)),
    ),
    option,
  );
  const validExportInfos = exportInfos.filter(
    (exportInfo) =>
      isFalse(validateResult.filePaths.includes(exportInfo.resolvedFilePath)) &&
      isFalse(exportDuplicationValidateResult.filePaths.includes(exportInfo.resolvedFilePath)),
  );

  const dirPath = posixJoin(env.exampleType03Path, 'popcorn');
  const result = await getDecendentExportInfo(dirPath, option, validExportInfos, ignores);

  const expectation = await import(path.join(__dirname, 'expects', expectFileName));

  expect(result).toEqual(expectation.default);
});

test('c004-mergeCreateIndexInfo', async () => {
  const target = {
    depth: 5,
    resolvedDirPath: 'dirpath',
    resolvedFilePath: undefined,
    exportStatement: 'export * from ./test',
  };

  const origin = {
    depth: 5,
    resolvedDirPath: 'dirpath',
    resolvedFilePaths: undefined,
    exportStatements: ['export * from ./origin'],
  };

  const result = mergeCreateIndexInfo(origin, target);

  const expectation = {
    depth: 5,
    resolvedDirPath: 'dirpath',
    resolvedFilePaths: undefined,
    exportStatements: ['export * from ./origin', 'export * from ./test'],
  };

  expect(result).toEqual(expectation);
});