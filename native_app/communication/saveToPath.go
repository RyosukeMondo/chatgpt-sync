package communication

import (
    "log"
    "path/filepath"
    "os"
)

func HandleSaveToPath(msg SaveToPathRequest) SaveToPathResponse {
    if msg.FilePath == "" || msg.Content == "" {
        return SaveToPathResponse{
            Status: "fail",
            Error:  "FilePath or Content is empty.",
        }
    }

    // Ensure the directory exists
    dir := filepath.Dir(msg.FilePath)
    err := os.MkdirAll(dir, os.ModePerm)
    if err != nil {
        log.Printf("Error creating directories for path %s: %v", msg.FilePath, err)
        return SaveToPathResponse{
            Status: "fail",
            Error:  err.Error(),
        }
    }

    // Write the code to the file
    err = os.WriteFile(msg.FilePath, []byte(msg.Content), 0644)
    if err != nil {
        log.Printf("Error writing to file %s: %v", msg.FilePath, err)
        return SaveToPathResponse{
            Status: "fail",
            Error:  err.Error(),
        }
    }

    log.Printf("Successfully saved file: %s", msg.FilePath)
    return SaveToPathResponse{
        Status: "success",
    }
}