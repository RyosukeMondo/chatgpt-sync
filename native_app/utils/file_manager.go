package utils

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// ValidatePath resolves a path to its absolute, symlink-resolved form and
// rejects paths containing traversal sequences. Returns the cleaned path.
func ValidatePath(path string) (string, error) {
	cleaned := filepath.Clean(path)

	// Reject paths that still contain traversal after cleaning
	if strings.Contains(cleaned, "..") {
		return "", fmt.Errorf("path traversal detected: %s", path)
	}

	// Ensure the path is absolute
	if !filepath.IsAbs(cleaned) {
		return "", fmt.Errorf("relative paths are not allowed: %s", path)
	}

	return cleaned, nil
}

// SaveToFile writes code to the given absolute file path.
// The path must be absolute and must not contain traversal sequences.
func SaveToFile(path string, code string) error {
	cleanPath, err := ValidatePath(path)
	if err != nil {
		log.Printf("パス検証エラー: %v", err)
		return err
	}

	dir := filepath.Dir(cleanPath)
	err = os.MkdirAll(dir, 0750)
	if err != nil {
		log.Printf("パス %s のディレクトリ作成エラー: %v", cleanPath, err)
		return err
	}

	err = os.WriteFile(cleanPath, []byte(code), 0644)
	if err != nil {
		log.Printf("ファイル %s への書き込みエラー: %v", cleanPath, err)
		return err
	}

	log.Printf("ファイルを正常に保存しました: %s", cleanPath)
	return nil
}

// GetCodeTree recursively lists all non-binary files under the given absolute path.
func GetCodeTree(path string) ([]string, error) {
	cleanPath, err := ValidatePath(path)
	if err != nil {
		log.Printf("パス検証エラー: %v", err)
		return nil, err
	}
	path = cleanPath

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

// GetContents reads and returns the contents of the file at the given absolute path.
func GetContents(path string) (string, error) {
	cleanPath, err := ValidatePath(path)
	if err != nil {
		log.Printf("パス検証エラー: %v", err)
		return "", err
	}

	content, err := os.ReadFile(cleanPath)
	if err != nil {
		log.Printf("ファイル %s の読み込みエラー: %v", cleanPath, err)
		return "", err
	}
	return string(content), nil
}
