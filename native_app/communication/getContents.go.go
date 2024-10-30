package communication

import (
	"chatgpt_sync/utils"
	"log"
)

func HandleGetContents(req GetContentsRequest) GetContentsResponse {
	if len(req.FilePaths) == 0 {
		return GetContentsResponse{
			Contents: nil,
			Error:    "FilePaths are empty.",
		}
	}

	var contents []string
	for _, path := range req.FilePaths {
		content, err := utils.GetContents(path)
		if err != nil {
			log.Printf("Error getting contents of %s: %v", path, err)
			return GetContentsResponse{
				Contents: nil,
				Error:    err.Error(),
			}
		}
		contents = append(contents, content)
	}

	return GetContentsResponse{
		Contents: contents,
		Error:    "",
	}
}
