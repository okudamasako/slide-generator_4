# AIスライド自動生成システム

テーマ・ターゲット・目的を入力するだけで、
PowerPoint（.pptx）を自動生成できるWebアプリです。

Claude APIを利用してスライド構成を生成し、
PowerPoint形式でダウンロードできます。

## 主な機能

- AIによるスライド構成生成
- PowerPoint（.pptx）自動生成
- テーマ・ターゲット別の構成最適化
- ブラウザ上で完結
- PowerPointファイルのダウンロード対応

## 使用技術

- HTML
- JavaScript
- Claude API
- PptxGenJS
- Vercel

## ファイル構成

```text
/
├── index.html
├── api/
│   ├── generate.js
│   └── download.js
├── package.json
└── README.md
```

## デモ

[デモサイトはこちら](https://slide-generator-4.vercel.app/)

## 注意事項

- APIキーはGitHubへアップロードしない
- 環境変数はVercel側で設定
- 商用利用時はPptxGenJSライセンス確認推奨

## 補足

AIを活用したスライド生成・PowerPoint自動出力システムとして、
実験・運用しているプロジェクトです。
