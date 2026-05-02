# AIスライド自動生成システム

テーマ・ターゲット・目的を入力するだけで、PowerPoint（.pptx）を自動生成するWebアプリです。

## ファイル構成

```
/
├── index.html          ← フロントエンド
├── api/
│   ├── generate.js     ← スライド構成生成API（Claude API呼び出し）
│   └── download.js     ← pptxファイル生成API
├── package.json
└── README.md
```

## デプロイ手順

### 1. GitHubにリポジトリを作成

1. GitHub（https://github.com）を開く
2. 右上の「+」→「New repository」をクリック
3. Repository name：`ai-slide-generator`（任意）
4. 「Create repository」をクリック
5. 上記4ファイルをすべてアップロード（api/フォルダごと）

### 2. Vercelに接続

1. Vercel（https://vercel.com）を開く
2. 「New Project」をクリック
3. 作成したGitHubリポジトリを選択
4. 「Import」をクリック

### 3. 環境変数を設定

Vercelの「Environment Variables」に以下を追加：

| 変数名 | 値 |
|--------|-----|
| `ANTHROPIC_API_KEY` | AnthropicのAPIキー |

※ APIキーは https://console.anthropic.com で取得できます。

### 4. デプロイ

「Deploy」をクリック → 完了！

URLが発行されます（例：`https://ai-slide-generator-xxx.vercel.app`）

## 注意事項

- `.env`ファイルは絶対にGitHubにアップしないこと
- APIキーはVercelの環境変数にのみ設定すること
- 商用利用の場合はPptxGenJSのライセンスを確認すること
