package utils

import (
	"fmt"
	"log"
	"os"
)

// ロガーを初期化する
func InitLogger() (*os.File, error) {
	logFilePath := "./log.txt"
	logFile, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return nil, fmt.Errorf("ログファイル %s のオープンに失敗: %v", logFilePath, err)
	}

	log.SetOutput(logFile)
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
	log.Println("ロガー初期化完了。")
	return logFile, nil
}
