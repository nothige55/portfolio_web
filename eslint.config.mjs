import fs from "node:fs";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// features 하위 디렉터리를 읽어 feature 간 교차 import 금지 zone을 자동 생성
const featureDirectories = fs.existsSync("./src/features")
  ? fs
      .readdirSync("./src/features", { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

const crossFeatureZones = featureDirectories.map((featureName) => ({
  target: `./src/features/${featureName}`,
  from: "./src/features",
  except: [`./${featureName}`],
}));

// 공용 레이어는 상위 레이어(features/app)에 의존하지 않는다
const sharedLayerTargets = [
  "./src/assets",
  "./src/components",
  "./src/config",
  "./src/hooks",
  "./src/lib",
  "./src/stores",
  "./src/testing",
  "./src/types",
  "./src/utils",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // bulletproof-react 단방향 의존: app → features → 공용 레이어
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            ...crossFeatureZones,
            { target: "./src/features", from: "./src/app" },
            { target: sharedLayerTargets, from: ["./src/features", "./src/app"] },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 에이전트 워크트리가 루트 안에 생기면 낡은 사본까지 검사 대상이 됨
    ".claude",
    ".codex",
  ]),
]);

export default eslintConfig;
