package communication

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
)

func HandleMessage(msg interface{}) {
	log.Printf("Received message: %+v", msg)
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
		log.Printf("不明なメッセージタイプ: %+v", msg)
		SendMessage(map[string]string{
			"status":  "error",
			"message": "不明なメッセージタイプです。",
		})
	}
}

// ReadMessage は標準入力からメッセージを読み取ります
func ReadMessage() (interface{}, error) {
	var length uint32
	err := binary.Read(os.Stdin, binary.LittleEndian, &length)
	if err != nil {
		log.Printf("メッセージ長読み取りエラー: %v", err)
		return nil, err
	}

	messageBytes := make([]byte, length)
	n, err := io.ReadFull(os.Stdin, messageBytes)
	if err != nil {
		log.Printf("メッセージ読み取りエラー: %v", err)
		return nil, err
	}
	log.Printf("Read %d bytes: %s", n, string(messageBytes))

	var raw map[string]interface{}
	if err := json.Unmarshal(messageBytes, &raw); err != nil {
		log.Printf("JSONデコードエラー: %v", err)
		return nil, err
	}

	kind, ok := raw["kind"].(string)
	if !ok {
		err := fmt.Errorf("invalid message format: 'kind' field is missing or not a string")
		log.Printf("メッセージ形式エラー: %v", err)
		return nil, err
	}

	log.Printf("Message kind: %s", kind)

	switch MessageKind(kind) {
	case SaveToPath:
		var req SaveToPathRequest
		if err := mapToStruct(raw, &req); err != nil {
			log.Printf("mapToStructエラー: %v", err)
			return nil, err
		}
		return req, nil
	case GetCodeTree:
		var req GetCodeTreeRequest
		if err := mapToStruct(raw, &req); err != nil {
			log.Printf("mapToStructエラー: %v", err)
			return nil, err
		}
		return req, nil
	case GetContents:
		var req GetContentsRequest
		if err := mapToStruct(raw, &req); err != nil {
			log.Printf("mapToStructエラー: %v", err)
			return nil, err
		}
		return req, nil
	// 他のケースを追加
	default:
		err := fmt.Errorf("unsupported message kind: %s", kind)
		log.Printf("サポートされていないメッセージ種別: %s", kind)
		return nil, err
	}
}

// SendMessage はメッセージを標準出力に送信します
func SendMessage(msg interface{}) error {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("メッセージmarshalエラー: %v", err)
		return err
	}

	length := uint32(len(data))
	err = binary.Write(os.Stdout, binary.LittleEndian, length)
	if err != nil {
		log.Printf("メッセージ長書き込みエラー: %v", err)
		return err
	}

	n, err := os.Stdout.Write(data)
	if err != nil {
		log.Printf("メッセージ送信エラー: %v", err)
		return err
	}
	log.Printf("Sent %d bytes: %s", n, string(data))
	return nil
}

func mapToStruct(m map[string]interface{}, s interface{}) error {
	bytes, err := json.Marshal(m)
	if err != nil {
		return err
	}
	return json.Unmarshal(bytes, s)
}
