import * as env from '@testenv/env';
import { posixJoin } from '@tools/misc';
import { replaceSepToPosix } from 'my-node-fp';

export default [
  {
    depth: 4,
    resolvedDirPath: posixJoin(env.exampleType03Path, 'popcorn', 'finance', 'discipline'),
    exportStatements: [
      "export { default as case02 } from './case02'",
      "export { default as Case03 } from './case03'",
    ],
    resolvedFilePaths: [
      posixJoin(env.exampleType03Path, 'popcorn', 'finance', 'discipline', 'case02.ts'),
      posixJoin(env.exampleType03Path, 'popcorn', 'finance', 'discipline', 'case03.ts'),
    ],
  },
  {
    depth: 4,
    resolvedDirPath: posixJoin(env.exampleType03Path, 'popcorn', 'lawyer', 'appliance'),
    exportStatements: [
      "export { default as IKittens } from './IKittens'",
      "export * from './TomatoesCls'",
    ],
    resolvedFilePaths: [
      posixJoin(env.exampleType03Path, 'popcorn', 'lawyer', 'appliance', 'IKittens.ts'),
      posixJoin(env.exampleType03Path, 'popcorn', 'lawyer', 'appliance', 'TomatoesCls.ts'),
    ],
  },
  {
    depth: 3,
    resolvedDirPath: posixJoin(env.exampleType03Path, 'juvenile', 'spill'),
    exportStatements: ["export * from './ExperienceCls'"],
    resolvedFilePaths: [posixJoin(env.exampleType03Path, 'juvenile', 'spill', 'ExperienceCls.ts')],
  },
  {
    depth: 3,
    resolvedDirPath: posixJoin(env.exampleType03Path, 'wellmade', 'carpenter'),
    exportStatements: ["export * from './DiscussionCls'", "export * from './MakeshiftCls'"],
    resolvedFilePaths: [
      posixJoin(env.exampleType03Path, 'wellmade', 'carpenter', 'DiscussionCls.ts'),
      posixJoin(env.exampleType03Path, 'wellmade', 'carpenter', 'MakeshiftCls.ts'),
    ],
  },
  {
    depth: 1,
    resolvedDirPath: posixJoin(env.exampleType03Path, 'juvenile'),
    exportStatements: ["export * from './TriteCls'", "export * from './spill'"],
    resolvedFilePaths: [posixJoin(env.exampleType03Path, 'juvenile', 'TriteCls.ts')],
  },
  {
    depth: 1,
    resolvedDirPath: posixJoin(env.exampleType03Path, 'popcorn'),
    exportStatements: [
      "export { default as case01 } from './case01'",
      "export * from './finance/discipline'",
      "export * from './lawyer/appliance'",
    ],
    resolvedFilePaths: [posixJoin(env.exampleType03Path, 'popcorn', 'case01.ts')],
  },
  {
    depth: 1,
    resolvedDirPath: posixJoin(env.exampleType03Path, 'wellmade'),
    exportStatements: [
      "export * from './ChildlikeCls'",
      "export * from './FlakyCls'",
      "export * from './WhisperingCls'",
      "export * from './carpenter'",
    ],
    resolvedFilePaths: [
      posixJoin(env.exampleType03Path, 'wellmade', 'ChildlikeCls.ts'),
      posixJoin(env.exampleType03Path, 'wellmade', 'FlakyCls.ts'),
      posixJoin(env.exampleType03Path, 'wellmade', 'WhisperingCls.ts'),
    ],
  },
  {
    depth: 1,
    resolvedDirPath: replaceSepToPosix(env.exampleType03Path),
    exportStatements: [
      "export * from './BubbleCls'",
      "export * from './ComparisonCls'",
      "export * from './HandsomelyCls'",
      "export * from './SampleCls'",
    ],
    resolvedFilePaths: [
      posixJoin(env.exampleType03Path, 'BubbleCls.tsx'),
      posixJoin(env.exampleType03Path, 'ComparisonCls.tsx'),
      posixJoin(env.exampleType03Path, 'HandsomelyCls.tsx'),
      posixJoin(env.exampleType03Path, 'SampleCls.tsx'),
    ],
  },
];