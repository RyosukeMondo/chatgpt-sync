# ChatGPT Sync Extension

このプロジェクトは、ブラウザ拡張機能を通じてコードをローカルのネイティブアプリケーションに送信する機能を提供します。

## 主な機能

- **コード送信**: コードスニペットをネイティブアプリに送信します。
- **レスポンス管理**: 受信したレスポンスを一覧管理します。

## インストール方法

### ブラウザ拡張機能のインストール

1. [chrome-extension/manifest.js](chrome-extension/manifest.js) を確認してください。
2. 拡張機能をブラウザに読み込みます。

### ネイティブアプリケーションのインストール

1. [native_app/readme.md](native_app/readme.md) に従ってネイティブアプリをインストールしてください。
2. `com.your_company.chatgpt_sync.json` ファイルを設定します: [`native_app/com.your_company.chatgpt_sync.json`](native_app/com.your_company.chatgpt_sync.json)

## 使用方法

1. 拡張機能のオプションページを開きます: [`pages/options/src/Options.tsx`](pages/options/src/Options.tsx)
2. ネイティブアプリのパスを設定します。[`nativeAppPathStorage`](packages/storage/lib/impl/nativeAppPathStorage.ts)を使用します。
3. コードスニペットを選択し、「Send to Path」ボタンをクリックして送信します。

## 開発環境のセットアップ

1. 必要な依存関係をインストールします:

    ```sh
    pnpm install
    ```

2. 拡張機能をビルドします:

    ```sh
    pnpm run build
    ```
 
3. ネイティブアプリケーションをビルドします:

    ```sh
    cd native_app
    go build -o chatgpt_sync_native_app.exe main.go
    ```
