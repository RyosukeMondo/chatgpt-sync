package utils

import (
	"log"
	"os"
	"path/filepath"
)

// ファイルを保存する
func SaveToFile(path string, code string) error {
	dir := filepath.Dir(path)
	err := os.MkdirAll(dir, os.ModePerm)
	if err != nil {
		log.Printf("パス %s のディレクトリ作成エラー: %v", path, err)
		return err
	}

	err = os.WriteFile(path, []byte(code), 0644)
	if err != nil {
		log.Printf("ファイル %s への書き込みエラー: %v", path, err)
		return err
	}

	log.Printf("ファイルを正常に保存しました: %s", path)
	return nil
}

// コードツリーを取得する
func GetCodeTree(path string) ([]string, error) {
	var files []string
	err := filepath.Walk(path, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			files = append(files, p)
		}
		return nil
	})
	if err != nil {
		log.Printf("コードツリーの取得エラー: %v", err)
		return nil, err
	}
	return files, nil
}

// ファイルの内容を取得する
func GetContents(path string) (string, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		log.Printf("ファイル %s の読み込みエラー: %v", path, err)
		return "", err
	}
	return string(content), nil
}
