package communication

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
)

func HandleMessage(msg interface{}) {
	switch req := msg.(type) {
	case SaveToPathRequest:
		response := HandleSaveToPath(req)
		SendMessage(response)
	case GetCodeTreeRequest:
		response := HandleGetCodeTree(req)
		SendMessage(response)
	case GetContentsRequest:
		response := HandleGetContents(req)
		SendMessage(response)
	// 他のケースを追加
	default:
		log.Printf("不明なメッセージタイプ")
		SendMessage(map[string]string{
			"status":  "error",
			"message": "不明なメッセージタイプです。",
		})
	}
}

func ReadMessage() (interface{}, error) {
	var raw map[string]interface{}
	if err := json.NewDecoder(os.Stdin).Decode(&raw); err != nil {
		return nil, err
	}

	kind, ok := raw["kind"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid message format: 'kind' field is missing or not a string")
	}

	switch MessageKind(kind) {
	case SaveToPath:
		var req SaveToPathRequest
		if err := mapToStruct(raw, &req); err != nil {
			return nil, err
		}
		return req, nil
	case GetCodeTree:
		var req GetCodeTreeRequest
		if err := mapToStruct(raw, &req); err != nil {
			return nil, err
		}
		return req, nil
	case GetContents:
		var req GetContentsRequest
		if err := mapToStruct(raw, &req); err != nil {
			return nil, err
		}
		return req, nil
	// 他のケースを追加
	default:
		return nil, fmt.Errorf("unsupported message kind: %s", kind)
	}
}

func SendMessage(msg interface{}) error {
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	_, err = io.WriteString(os.Stdout, string(data)+"\n")
	return err
}

func mapToStruct(m map[string]interface{}, s interface{}) error {
	bytes, err := json.Marshal(m)
	if err != nil {
		return err
	}
	return json.Unmarshal(bytes, s)
}
