package communication

import (
	"chatgpt_sync/utils"
	"log"
)

// HandleGetCodeTree processes the GetCodeTreeRequest and returns a GetCodeTreeResponse
func HandleGetCodeTree(req GetCodeTreeRequest) GetCodeTreeResponse {
	log.Printf("Handling GetCodeTreeRequest for path: %s", req.TargetPath)
	if req.TargetPath == "" {
		log.Println("TargetPathが空です。")
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

	log.Printf("Successfully retrieved code tree for path: %s", req.TargetPath)
	return GetCodeTreeResponse{
		Repositories: repositories,
		Error:        "",
	}
}
