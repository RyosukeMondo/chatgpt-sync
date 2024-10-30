package chatgpt_sync_native_app

import (
    "fmt"
    "log"
    "os"

    "chatgpt_sync_native_app/communication"
    "chatgpt_sync_native_app/native_app"
)

func main() {
    logFile, err := native_app.InitLogger()
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

        communication.HandleMessage(msg)
    }

    log.Println("アプリケーション終了。")
}