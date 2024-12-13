package utils

import (
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
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
	var mutex sync.Mutex
	var wg sync.WaitGroup

	// Skip common non-code directories and files
	skipDirs := map[string]bool{
		"node_modules": true,
		".git":         true,
		"dist":         true,
		"build":        true,
		"target":       true,
		".idea":        true,
		".vscode":      true,
	}

	// Process a directory concurrently
	var processDir func(dir string) error
	processDir = func(dir string) error {
		entries, err := os.ReadDir(dir)
		if err != nil {
			return err
		}

		for _, entry := range entries {
			name := entry.Name()
			fullPath := filepath.Join(dir, name)

			if entry.IsDir() {
				// Skip excluded directories
				if skipDirs[name] {
					continue
				}

				// Process subdirectory in a new goroutine
				wg.Add(1)
				go func(path string) {
					defer wg.Done()
					if err := processDir(path); err != nil {
						log.Printf("Error processing directory %s: %v", path, err)
					}
				}(fullPath)
			} else {
				// Skip binary and non-code files
				if strings.HasSuffix(name, ".exe") ||
					strings.HasSuffix(name, ".dll") ||
					strings.HasSuffix(name, ".so") ||
					strings.HasSuffix(name, ".dylib") ||
					strings.HasSuffix(name, ".bin") ||
					strings.HasSuffix(name, ".obj") ||
					strings.HasSuffix(name, ".o") {
					continue
				}

				mutex.Lock()
				files = append(files, fullPath)
				mutex.Unlock()
			}
		}
		return nil
	}

	// Start processing from the root directory
	err := processDir(path)
	if err != nil {
		log.Printf("コードツリーの取得エラー: %v", err)
		return nil, err
	}

	// Wait for all goroutines to finish
	wg.Wait()

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
