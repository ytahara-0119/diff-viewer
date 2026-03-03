# diff-viewer 実装 TODO

## Phase 1: プロジェクトセットアップ
- [x] package.json 作成
- [x] electron.vite.config.ts 作成
- [x] tailwind.config.js / postcss.config.js 作成
- [x] tsconfig.json / tsconfig.node.json / tsconfig.web.json 作成
- [x] ディレクトリ構成作成
- [x] src/renderer/index.html 作成
- [x] src/renderer/src/index.css (Tailwindディレクティブ)
- [x] npm install 実行

## Phase 2: 共通型定義
- [x] src/renderer/src/types.ts

## Phase 3: 比較エンジン
- [x] src/main/compareEngine.ts

## Phase 4: IPC層
- [x] src/main/index.ts
- [x] src/preload/index.ts

## Phase 5: 状態管理
- [x] src/renderer/src/store/useCompareStore.ts
- [x] src/renderer/src/env.d.ts (Window.electronAPI型定義)

## Phase 6: UIコンポーネント
- [x] src/renderer/src/App.tsx
- [x] src/renderer/src/components/FolderSelector.tsx
- [x] src/renderer/src/components/DiffTree.tsx
- [x] src/renderer/src/components/DetailView.tsx
- [x] src/renderer/src/components/StatusBar.tsx

## Phase 7: 検証
- [x] tasks/test-fixtures/ 作成（identical/modified/added/removed各ケース）
- [x] npm run build でビルド成功確認
- [ ] npm run dev で起動確認（手動確認）
- [ ] 比較操作動作確認（手動確認）

## Review

### 完了したこと
- electron-vite + React + TypeScript + Tailwind CSS + Zustand でフルスタック構成
- 段階比較アルゴリズム（サイズ→mtime→SHA-256ハッシュ）実装
- バイナリ判定（NULL バイト検出）実装
- IPC層：selectFolder / startCompare / cancelCompare
- フィルタ機能（all/added/removed/modified/identical）
- テキストdiff表示（行単位、色分け）
- バイナリファイルはサイズ・ハッシュ・mtime比較表示
- ステータスバーに追加/削除/変更/同一カウント
- ビルド確認済み（エラーなし）

### テストフィクスチャ
- tasks/test-fixtures/folder-a/ と folder-b/ に4ケースを用意
