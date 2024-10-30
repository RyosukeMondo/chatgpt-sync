package native_app

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