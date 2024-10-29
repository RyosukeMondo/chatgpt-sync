package communication

type SaveToPathRequest struct {
	Kind     string `json:"kind"`
	FilePath string `json:"filePath"`
	Content  string `json:"content"`
}

type SaveToPathResponse struct {
	Status string `json:"status"`
	Error  string `json:"error,omitempty"`
}

type GetCodeTreeRequest struct {
	Kind       string `json:"kind"`
	TargetPath string `json:"target_path"`
}

type GetCodeTreeResponse struct {
	Repositories []string `json:"repositories"`
	Error        string   `json:"error,omitempty"`
}

type GetContentsRequest struct {
	Kind      string   `json:"kind"`
	FilePaths []string `json:"filePaths"`
}

type GetContentsResponse struct {
	Contents []string `json:"contents"`
	Error    string   `json:"error,omitempty"`
}
