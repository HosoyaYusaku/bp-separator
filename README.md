# Business Process Separator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**"AI is not a magic wand."**

Business Process Separator is a BPR (Business Process Re-engineering) support tool designed to visualize the realistic role of AI in your workflow. Instead of expecting AI to solve everything like magic, this tool coldly separates your tasks into **"AI_OPTIMAL"**, **"HYBRID"**, and **"HUMAN_ESSENTIAL"** using your choice of the OpenAI, Google Gemini, or Anthropic Claude API.

It provides a clear, card-based diagnostic report to help you build a grounded and effective digital transformation strategy.

---

## ✨ Features

- **Philosophy-Driven Analysis**
  - Based on the concept that "AI is not a magic wand," it categorizes tasks with logical precision.
- **Three-Tier Classification**
  - **AI_OPTIMAL**: Tasks best suited for automation.
  - **HYBRID**: Tasks requiring human-AI collaboration.
  - **HUMAN_ESSENTIAL**: Tasks where human judgment and empathy are irreplaceable.
- **Drag & Drop Interface**
  - Easily organize your workflow context and task list with an Excel-like UI.
- **High Security**
  - **BYOK (Bring Your Own Key)**: The selected provider’s API key is sent directly from your browser to that provider. It is never stored on our servers.
- **Three Cost-Efficient AI Providers**
  - Choose **OpenAI / GPT-6 Luna**, **Google / Gemini 3.5 Flash-Lite**, or **Anthropic / Claude Haiku 5.5**. Gemini remains the default.
- **Print Friendly**
  - Optimized black-and-white layout for business reports.

---

## 🌐 Live Demo

**Project App:** https://hosoyayusaku.github.io/bp-separator/

This application runs entirely in your browser using React and the selected provider’s API.

---

## AI Providers, Keys and Usage Costs

Standard text API prices checked on **2026-10-24**, in USD per **1 million tokens**, for short prompts up to 100,000 input tokens. These are API token prices, not a per-run quote; generated reasoning tokens can also be billed as output. No web search or other paid tools are enabled by this application.

| Provider | Model | Input | Output | Get your own API key |
|---|---|---:|---:|---|
| OpenAI | GPT-6 Luna (`gpt-6-luna`) | $0.10 | $0.50 | [OpenAI Platform](https://platform.openai.com/api-keys) |
| Google Gemini | Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`) | $0.30 | $2.50 | [Google AI Studio](https://aistudio.google.com/apikey) |
| Anthropic Claude | Claude Haiku 5.5 (`claude-haiku-5-5`) | $0.10 | $0.50 | [Claude Console](https://platform.claude.com/settings/keys) |

Choose the provider/model in System Configuration, then enter that provider’s API key. Keys are kept separately **in page memory only**. Switching providers does not send another provider’s key, and reloading the page clears all keys. The clear button removes the currently selected key. Never put a personal or shared key in source code or a public build.

Input text and the selected key are sent directly to the chosen provider’s official API; this project has no application backend or relay. The provider’s own data policies apply. Claude direct browser access uses the provider’s explicit browser opt-in header. Browser policies, API-key permissions, billing and model access can affect availability. API usage is billed separately from ChatGPT or Claude chat subscriptions.

The application requests structured JSON, checks required report fields and categories, and stops on refusal or truncated output. It does not automatically retry or switch providers. Model cost-effectiveness for your specific workload should be checked with a small sample.

Official references: [OpenAI model/pricing](https://developers.openai.com/api/docs/models/gpt-6-luna), [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing). Haiku prompts above 100,000 input tokens have higher input and output rates. Prices and account limits can change.

### Build, Preview and Publish

```bash
npm ci --ignore-scripts
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

After checking the preview, stop it with Ctrl+C. Commit and push the source changes, then run `npm run deploy` to publish `dist` to `gh-pages`. GitHub Pages uses **Deploy from a branch → gh-pages → /(root)**. A push to main alone does not publish this project’s build.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 22.x**: v22.23.4 or later (Tested on v22.23.4 / npm v10.9.9)
- **An API key for your selected provider**

### Setup & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/HosoyaYusaku/bp-separator.git
   cd bp-separator
   ```
2. Install dependencies:

   ```bash
   npm ci --ignore-scripts
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 🧩 Third-Party

This project is built on the shoulders of giants. We gratefully use the following open-source libraries:

- **React & ReactDOM**: MIT License
- **Vite**: MIT License
- **Tailwind CSS**: MIT License
- **Framer Motion**: MIT License
- **Lucide React**: ISC License

For detailed license information, please refer to [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

---

## 📄 License

This project is licensed under the **MIT License**.  
See [LICENSE](LICENSE) for details.

---

---

# Business Process Separator (ビジネス・プロセス・セパレーター)

**「AI は魔法の杖ではありません」**

Business Process Separator は、AI への過度な期待を排し、現実的な業務改革（BPR）を支援するための Web ツールです。  
OpenAI・Google Gemini・Anthropic Claude から選んだ事業者の API を活用し、入力された業務タスクを\*\*「AI 最適（AI_OPTIMAL）」「協働（HYBRID）」「人間必須（HUMAN_ESSENTIAL）」\*\*の 3 つに冷徹に仕分け（Separate）します。

---

## ✨ 主な機能

- **思想に基づく分析**
  - AI を万能な魔法としてではなく、適材適所のツールとして位置づけるための診断を行います。
- **3 段階の明確な仕分け**
  - 青（AI 最適）、黄（協働）、赤（人間必須）のシグナルカラーで、どこに AI を導入すべきかを可視化します。
- **直感的な操作**
  - Excel ライクな入力フォームで、業務フローの追加・並び替えがドラッグ＆ドロップで可能です。
- **高セキュリティ設計**
  - **BYOK (Bring Your Own Key)** 方式を採用。API キーと入力データはブラウザから選択した AI 事業者へ直接送信され、当アプリのサーバーには一切保存されません。
- **低コストの AI モデルを 3 社から選択**
  - **OpenAI / GPT-6 Luna**、**Google / Gemini 3.5 Flash-Lite**、**Anthropic / Claude Haiku 5.5** を選択できます。初期選択は Gemini です。
- **印刷対応**
  - 白黒印刷時でも視認性の高い「ドキュメントモード」でレポートを出力できます。

---

## 🌐 デモ（GitHub Pages）

**公開アプリ:** https://hosoyayusaku.github.io/bp-separator/

---

## AI 事業者・API キー・利用料金

**2026-10-24 確認時点**の通常テキスト API 料金です。入力 100,000 トークン以下の短い入力を前提に、**100 万トークン当たりの米ドル**を示します。1 回の実行料金ではなく、実際の入出力量で変わります。推論に使われるトークンも出力として課金される場合があります。このツールは Web 検索などの有料追加ツールを使いません。

| 事業者 | モデル | 入力 | 出力 | API キー取得先 |
|---|---|---:|---:|---|
| OpenAI | GPT-6 Luna | $0.10 | $0.50 | [OpenAI Platform](https://platform.openai.com/api-keys) |
| Google Gemini | Gemini 3.5 Flash-Lite | $0.30 | $2.50 | [Google AI Studio](https://aistudio.google.com/apikey) |
| Anthropic Claude | Claude Haiku 5.5 | $0.10 | $0.50 | [Claude Console](https://platform.claude.com/settings/keys) |

設定欄で事業者・モデルを選び、その事業者の API キーを入力します。キーは事業者ごとに分けて **ページのメモリだけ**に保持します。切り替え先へ別事業者のキーを送ることはありません。再読み込みですべて消え、削除ボタンでは選択中のキーを消去します。個人用・共用のキーを公開コードやビルドへ書き込まないでください。

入力内容と選択中のキーは、ブラウザから選択先の公式 API へ直接送信されます。このツール専用のバックエンドや中継サーバーはありません。送信先事業者のデータ取り扱い方針が適用されます。Claude には公式 API のブラウザ利用を明示するヘッダーを付けています。ブラウザの制限、キーの権限、課金設定、モデル利用資格によって接続できない場合があります。API の利用料金は ChatGPT・Claude のチャット契約とは別です。

応答は構造化 JSON で取得し、レポートの必須項目と分類を確認してから表示します。拒否・出力途中終了では処理を止め、自動再試行や他社への自動切り替えは行いません。用途に対する品質とコストは、短いサンプルで比較してください。

公式資料: [OpenAI](https://developers.openai.com/api/docs/models/gpt-6-luna)、[Gemini](https://ai.google.dev/gemini-api/docs/pricing)、[Claude](https://platform.claude.com/docs/en/about-claude/pricing)。Haiku の入力が 100,000 トークンを超える場合は入力・出力の両単価が上がります。料金や利用枠は変更される場合があります。

### ビルド・確認・公開

```bash
npm ci --ignore-scripts
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

プレビューを確認して Ctrl+C で停止した後、変更をコミット・プッシュし、`npm run deploy` で `dist` を `gh-pages` へ公開します。GitHub Pages の設定は **Deploy from a branch → gh-pages → /(root)** です。main へのプッシュに加えて公開コマンドを実行します。

---

## 🚀 開発環境の構築

### 前提条件

- **Node.js 22.x**: v22.23.4 以降 (v22.23.4 / npm v10.9.9 で動作確認済み)
- **選択する AI 事業者の API キー**

### セットアップ手順

1.  リポジトリをクローン:

    ```bash
    git clone https://github.com/HosoyaYusaku/bp-separator.git
    cd bp-separator
    ```

2.  依存関係をインストール:

    ```bash
    npm ci --ignore-scripts
    ```

3.  開発サーバーを起動:

    ```bash
    npm run dev
    ```

4.  ブラウザで `http://localhost:5173` を開いてください。

---

## 🧩 サードパーティ

本プロジェクトは、以下の素晴らしいオープンソースライブラリを活用しています。

- **React & ReactDOM**: MIT License
- **Vite**: MIT License
- **Tailwind CSS**: MIT License
- **Framer Motion**: MIT License
- **Lucide React**: ISC License

各ライブラリのライセンス詳細については [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) をご覧ください。

---

## 📄 ライセンス

このプロジェクトは **MIT ライセンス** で公開されています。  
詳細は [LICENSE](LICENSE) をご確認ください。
