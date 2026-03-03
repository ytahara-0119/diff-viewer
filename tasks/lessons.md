# Lessons Learned

## セットアップ

- macOS の bash サンドボックスでは `mkdir -p a/b/c` が動作しない場合がある。個別に `mkdir` を呼ぶか、Writeツールでファイルを作成するとディレクトリが自動生成される。
- `@electron-toolkit/tsconfig` は追加パッケージが必要で、手書き tsconfig の方がシンプル。
- electron-vite のデフォルト構成では `src/renderer/index.html` + `src/renderer/src/main.tsx` が entry point になる。

## TypeScript

- `Window.electronAPI` は `src/renderer/src/env.d.ts` で `declare global { interface Window { electronAPI: ElectronAPI } }` として宣言する。
- preload の ElectronAPI 型と renderer の env.d.ts は同じ型シグネチャを保つ。

## Zustand

- Zustand v5 では `create<State>((set, get) => ...)` のシグネチャを使う（v4との互換性あり）。
- `filteredResults` を store 内のメソッドとして定義するとコンポーネント側がシンプルになる。

## electron-vite ビルド

- `ELECTRON_RENDERER_URL` 環境変数で dev サーバーとプロダクションビルドを切り替える。
- `sandbox: false` が必要な場合がある（preload スクリプトが Node API を使う場合）。
