package communication

import (
	"chatgpt_sync/utils"
	"log"
)

func HandleSaveToPath(msg SaveToPathRequest) SaveToPathResponse {
	if msg.FilePath == "" || msg.Content == "" {
		return SaveToPathResponse{
			Status: "fail",
			Error:  "FilePath or Content is empty.",
		}
	}

	err := utils.SaveToFile(msg.FilePath, msg.Content)
	if err != nil {
		log.Printf("Error saving file %s: %v", msg.FilePath, err)
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
