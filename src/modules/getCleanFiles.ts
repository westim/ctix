import { TOptionWithResolvedProject } from '@configs/interfaces/IOption';
import fastGlob from 'fast-glob';
import { getDirname, replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

export default async function getCleanFiles(
  project: tsm.Project,
  option: TOptionWithResolvedProject,
) {
  const filePaths = project
    .getSourceFiles()
    .map((sourceFile) => replaceSepToPosix(sourceFile.getFilePath()));

  const dirPaths = (await Promise.all(filePaths.map((filePath) => getDirname(filePath)))).map(
    (dirPath) => replaceSepToPosix(dirPath),
  );

  const globPatterns = dirPaths.map((dirPath) =>
    replaceSepToPosix(path.join(dirPath, '**', option.exportFilename)),
  );

  const files = await fastGlob(globPatterns, { dot: true, cwd: option.project });

  return files;
}