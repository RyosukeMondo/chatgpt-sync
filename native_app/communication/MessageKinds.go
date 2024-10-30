package communication

type MessageKind string

const (
	SaveToPath  MessageKind = "SAVE_TO_PATH"
	GetCodeTree MessageKind = "GET_CODE_TREE"
	GetContents MessageKind = "GET_CONTENTS"
	// 他のメッセージ種別をここに追加
)

type SaveToPathRequest struct {
	Kind     MessageKind `json:"kind"`
	FilePath string      `json:"filePath"`
	Content  string      `json:"content"`
}

type SaveToPathResponse struct {
	Status string `json:"status"`
	Error  string `json:"error,omitempty"`
}

type GetCodeTreeRequest struct {
	Kind       MessageKind `json:"kind"`
	TargetPath string      `json:"target_path"`
}

type GetCodeTreeResponse struct {
	Repositories []string `json:"repositories"`
	Error        string   `json:"error,omitempty"`
}

type GetContentsRequest struct {
	Kind      MessageKind `json:"kind"`
	FilePaths []string    `json:"filePaths"`
}

type GetContentsResponse struct {
	Contents []string `json:"contents"`
	Error    string   `json:"error,omitempty"`
}
