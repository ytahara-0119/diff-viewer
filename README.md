# diff-viewer

macOS向けのディレクトリ比較ツール。WinMergeのようなシンプルで直感的な操作感を提供します。

## 特徴

- 左右2ペインでフォルダを選択し、差分をツリー表示
- ファイルの状態を色分け表示（追加 / 削除 / 変更 / 同一）
- テキストファイルの行単位diff表示
- バイナリファイルのサイズ・ハッシュ・更新日時表示
- フィルタ機能（すべて / 変更のみ / 追加のみ / 削除のみ / 同一を隠す）
- 大規模フォルダでもUIがフリーズしない段階比較アルゴリズム（サイズ → mtime → SHA-256 → テキストdiff）
- スキャン進捗インジケータ付きステータスバー

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Electron 31 + electron-vite 2 |
| UI | React 18 + TypeScript |
| スタイル | Tailwind CSS v3 |
| 状態管理 | Zustand v5 |
| diff生成 | diff v7 |
| ビルド | Vite 5 |

## ディレクトリ構成

```
src/
├── main/
│   ├── index.ts          # Electronメインプロセス
│   └── compareEngine.ts  # 比較エンジン（IPC処理）
├── preload/
│   └── index.ts          # contextBridge / IPC公開
└── renderer/src/
    ├── App.tsx
    ├── main.tsx
    ├── types.ts
    ├── components/
    │   ├── FolderSelector.tsx
    │   ├── DiffTree.tsx
    │   ├── DetailView.tsx
    │   └── StatusBar.tsx
    └── store/
        └── useCompareStore.ts
```

## セキュリティ設定

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: false`
- IPCはpreload経由で最小限のチャネルのみ公開

## IPC チャネル

| 方向 | チャネル | 用途 |
|---|---|---|
| Renderer → Main | `selectFolder` | フォルダ選択ダイアログ |
| Renderer → Main | `startCompare` | 比較開始 |
| Renderer → Main | `cancelCompare` | 比較キャンセル |
| Main → Renderer | `compareProgress` | 進捗通知 |
| Main → Renderer | `compareResult` | 比較結果 |
| Main → Renderer | `compareError` | エラー通知 |

## 開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# ビルド済みをプレビュー
npm start
```

## 今後の拡張候補

- フォルダ同期機能
- 差分マージ
- ignoreパターン指定
- Git連携
- 差分キャッシュ
- 並列処理最適化
