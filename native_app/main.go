package chatgpt_sync_native_app

import (
    "encoding/json"
    "fmt"
    "log"
    "os"
    "path/filepath"

    "chatgpt_sync_native_app/communication"
)

// Initialize logger
func initLogger() (*os.File, error) {
    logFilePath := "./log.txt"
    logFile, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
    if err != nil {
        return nil, fmt.Errorf("ログファイル %s のオープンに失敗: %v", logFilePath, err)
    }

    // ログ出力とフォーマットを設定
    log.SetOutput(logFile)
    log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

    log.Println("ロガー初期化完了。")
    return logFile, nil
}

func saveToFile(path string, code string) error {
    // ディレクトリが存在することを確認
    dir := filepath.Dir(path)
    err := os.MkdirAll(dir, os.ModePerm)
    if err != nil {
        log.Printf("パス %s のディレクトリ作成エラー: %v", path, err)
        return err
    }

    // ファイルにコードを書き込む
    err = os.WriteFile(path, []byte(code), 0644)
    if err != nil {
        log.Printf("ファイル %s への書き込みエラー: %v", path, err)
        return err
    }

    log.Printf("ファイルを正常に保存しました: %s", path)
    return nil
}

func main() {
    logFile, err := initLogger()
    if err != nil {
        fmt.Fprintf(os.Stderr, "ロガーの初期化に失敗: %v\n", err)
        os.Exit(1)
    }
    defer func() {
        log.Println("ロガーをシャットダウン中。")
        logFile.Close()
    }()

    log.Println("アプリケーション開始。")

    for {
        msg, err := communication.ReadMessage()
        if err != nil {
            log.Printf("メッセージ読み取りエラー: %v。ループを終了します。", err)
            communication.SendMessage(map[string]string{
                "status":  "error",
                "message": fmt.Sprintf("メッセージの読み取りに失敗しました: %v", err),
            })
            break
        }

        switch req := msg.(type) {
        case communication.SaveToPathRequest:
            response := communication.HandleSaveToPath(req)
            communication.SendMessage(response)
        // 他のリクエストタイプを処理
        default:
            log.Printf("不明なメッセージタイプ")
            communication.SendMessage(map[string]string{
                "status":  "error",
                "message": "不明なメッセージタイプ��す。",
            })
        }
    }

    log.Println("アプリケーション終了。")
}