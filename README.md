# Business Process Separator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**"AI is not a magic wand."**

Business Process Separator is a BPR (Business Process Re-engineering) support tool designed to visualize the realistic role of AI in your workflow. Instead of expecting AI to solve everything like magic, this tool coldly separates your tasks into **"AI_OPTIMAL"**, **"HYBRID"**, and **"HUMAN_ESSENTIAL"** using the Google Gemini API.

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
  - **BYOK (Bring Your Own Key)**: Your Google Gemini API Key is sent directly from your browser to Google servers. It is never stored on our servers.
- **Selectable AI Models**
  - Choose from **Gemini 2.5 Pro** (High Intelligence), **Flash** (Balanced), or **Flash-Lite** (Cost-Effective).
- **Print Friendly**
  - Optimized black-and-white layout for business reports.

---

## 🌐 Live Demo

**Project App:** https://hosoyayusaku.github.io/bp-separator/

This application runs entirely in your browser using React and the Google Gemini API.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v22.17.0 or later (Tested on v22.17.0 / npm v11.6.1)
- **Google Gemini API Key**

### Setup & Run

1. Clone the repository:
   ```bash
   git clone [https://github.com/HosoyaYusaku/bp-separator.git](https://github.com/HosoyaYusaku/bp-separator.git)
   cd bp-separator
   ```
2. Install dependencies:

   ```bash
   npm install
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
- **Google Generative AI SDK**: Apache-2.0 License
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
Google Gemini API を活用し、入力された業務タスクを\*\*「AI 最適（AI_OPTIMAL）」「協働（HYBRID）」「人間必須（HUMAN_ESSENTIAL）」\*\*の 3 つに冷徹に仕分け（Separate）します。

---

## ✨ 主な機能

- **思想に基づく分析**
  - AI を万能な魔法としてではなく、適材適所のツールとして位置づけるための診断を行います。
- **3 段階の明確な仕分け**
  - 青（AI 最適）、黄（協働）、赤（人間必須）のシグナルカラーで、どこに AI を導入すべきかを可視化します。
- **直感的な操作**
  - Excel ライクな入力フォームで、業務フローの追加・並び替えがドラッグ＆ドロップで可能です。
- **高セキュリティ設計**
  - **BYOK (Bring Your Own Key)** 方式を採用。API キーと入力データはブラウザから直接 Google へ送信され、当アプリのサーバーには一切保存されません。
- **選べる AI モデル**
  - 賢い **Gemini 2.5 Pro**、標準的な **Flash**、高速な **Flash-Lite** から用途に合わせて選択可能です。
- **印刷対応**
  - 白黒印刷時でも視認性の高い「ドキュメントモード」でレポートを出力できます。

---

## 🌐 デモ（GitHub Pages）

**公開アプリ:** https://hosoyayusaku.github.io/bp-separator/

---

## 🚀 開発環境の構築

### 前提条件

- **Node.js**: v22.17.0 以降 (v22.17.0 / npm v11.6.1 で動作確認済み)
- **Google Gemini API キー**

### セットアップ手順

1.  リポジトリをクローン:

    ```bash
    git clone [https://github.com/HosoyaYusaku/bp-separator.git](https://github.com/HosoyaYusaku/bp-separator.git)
    cd bp-separator
    ```

2.  依存関係をインストール:

    ```bash
    npm install
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
- **Google Generative AI SDK**: Apache-2.0 License
- **Tailwind CSS**: MIT License
- **Framer Motion**: MIT License
- **Lucide React**: ISC License

各ライブラリのライセンス詳細については [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) をご覧ください。

---

## 📄 ライセンス

このプロジェクトは **MIT ライセンス** で公開されています。  
詳細は [LICENSE](LICENSE) をご確認ください。
