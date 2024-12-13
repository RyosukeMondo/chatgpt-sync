#!/bin/bash

# 現在のGoバージョンを確認
go version

# 最新のGoバージョンを取得
LATEST_GO=$(curl -s https://go.dev/VERSION?m=text | head -n 1)
echo "最新のGoバージョン: ${LATEST_GO}"

# ダウンロードリンクを作成
DOWNLOAD_URL="https://dl.google.com/go/${LATEST_GO}.linux-amd64.tar.gz"
echo "ダウンロードURL: ${DOWNLOAD_URL}"

# 古いGoを削除
sudo rm -rf /usr/local/go

# 最新バージョンをダウンロード
wget $DOWNLOAD_URL

# アーカイブを展開
sudo tar -C /usr/local -xzf ${LATEST_GO}.linux-amd64.tar.gz

# PATHを設定
export PATH=$PATH:/usr/local/go/bin

# クリーンアップ
rm ${LATEST_GO}.linux-amd64.tar.gz

# インストールを確認
go version