import IExportInfo from '@compilers/interfaces/IExportInfo';
import { TOptionWithResolvedProject } from '@configs/interfaces/IOption';
import IGetIgnoredConfigContents from '@ignores/interfaces/IGetIgnoredConfigContents';
import getRelativeDepth from '@tools/getRelativeDepth';
import IDecendentExportInfo from '@tools/interface/IDecendentExportInfo';
import fastGlob from 'fast-glob';
import fs from 'fs';
import { isEmpty, isFalse } from 'my-easy-fp';
import { getDirname, isDescendant, replaceSepToPosix } from 'my-node-fp';
import path from 'path';

export default async function getDecendentExportInfo(
  parentFilePath: string,
  option: TOptionWithResolvedProject,
  exportInfos: IExportInfo[],
  ignores: IGetIgnoredConfigContents,
): Promise<IDecendentExportInfo[]> {
  const filePath = replaceSepToPosix(parentFilePath);
  const dirPath = await getDirname(filePath);
  const globPattern = replaceSepToPosix(path.join(dirPath, '**', '*'));

  const globIgnorePatterns = Object.entries(ignores)
    .filter(([ignoreFilePath]) => isDescendant(parentFilePath, ignoreFilePath, path.posix.sep))
    .filter(([, ignoreContent]) => ignoreContent === '*')
    .map(([ignoreFilePath]) => replaceSepToPosix(path.join(ignoreFilePath, '*')));

  const globDirPaths = await fastGlob(globPattern, {
    ignore: globIgnorePatterns,
    dot: true,
    onlyDirectories: true,
  });

  const decendents = await Promise.all(
    globDirPaths.map(async (globDirPath) => {
      const includeExportInfos = exportInfos
        .filter((exportInfo) => exportInfo.resolvedDirPath === globDirPath)
        .filter((exportInfo) => {
          const ignoreContent = ignores[exportInfo.resolvedFilePath];
          const namedExportIdentifiers = exportInfo.namedExports.map(
            (namedExport) => namedExport.identifier,
          );

          if (typeof ignoreContent === 'string' && ignoreContent === '*') {
            return false;
          }

          if (
            typeof ignoreContent === 'string' &&
            (ignoreContent === exportInfo.defaultExport?.identifier ||
              namedExportIdentifiers.includes(ignoreContent))
          ) {
            return false;
          }

          return isEmpty(ignoreContent);
        });

      const includeDirFilePaths = await fs.promises.readdir(globDirPath, { withFileTypes: true });

      return {
        dirPath: globDirPath,
        isTerminal: isFalse(
          includeDirFilePaths.some((includeDirFilePath) => includeDirFilePath.isDirectory()),
        ),
        depth: getRelativeDepth(option.topDirs, globDirPath),
        exportInfos: includeExportInfos,
      };
    }),
  );

  const sortedDecendents = decendents.sort((l, r) => l.depth - r.depth);
  return sortedDecendents;
}