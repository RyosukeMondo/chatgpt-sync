package communication

import (
	"chatgpt_sync/utils"
	"log"
)

func HandleGetCodeTree(req GetCodeTreeRequest) GetCodeTreeResponse {
	if req.TargetPath == "" {
		return GetCodeTreeResponse{
			Repositories: nil,
			Error:        "TargetPath is empty.",
		}
	}

	repositories, err := utils.GetCodeTree(req.TargetPath)
	if err != nil {
		log.Printf("Error getting code tree for %s: %v", req.TargetPath, err)
		return GetCodeTreeResponse{
			Repositories: nil,
			Error:        err.Error(),
		}
	}

	return GetCodeTreeResponse{
		Repositories: repositories,
		Error:        "",
	}
}
