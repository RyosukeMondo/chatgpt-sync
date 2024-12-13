package communication

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
)

// HandleMessage processes the incoming message and sends an appropriate response
func HandleMessage(msg interface{}) {
	log.Printf("Received message: %+v", msg)
	switch req := msg.(type) {
	case SaveToPathRequest:
		response := HandleSaveToPath(req)
<<<<<<< Updated upstream
		if err := SendMessage(response); err != nil {
			log.Printf("メッセージ送信エラー: %v", err)
			// Optionally, decide whether to continue or terminate
		}
	case GetCodeTreeRequest:
		response := HandleGetCodeTree(req)
		if err := SendMessage(response); err != nil {
			log.Printf("メッセージ送信エラー: %v", err)
			// Optionally, decide whether to continue or terminate
		}
	case GetContentsRequest:
		response := HandleGetContents(req)
		if err := SendMessage(response); err != nil {
			log.Printf("メッセージ送信エラー: %v", err)
			// Optionally, decide whether to continue or terminate
		}
=======
		SendMessage(response)
		return
	case GetCodeTreeRequest:
		response := HandleGetCodeTree(req)
		SendMessage(response)
		return
	case GetContentsRequest:
		response := HandleGetContents(req)
		SendMessage(response)
		return
>>>>>>> Stashed changes
	// 他のケースを追加
	default:
		log.Printf("不明なメッセージタイプ: %+v", msg)
		errorResponse := map[string]string{
			"status":  "error",
			"message": "不明なメッセージタイプです。",
<<<<<<< Updated upstream
		}
		if err := SendMessage(errorResponse); err != nil {
			log.Printf("メッセージ送信エラー: %v", err)
			// Optionally, decide whether to continue or terminate
		}
=======
		})
		return
>>>>>>> Stashed changes
	}
}

// ReadMessage reads a single message from stdin following the native messaging protocol
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

// SendMessage sends a message to stdout following the native messaging protocol
func SendMessage(msg interface{}) error {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("メッセージmarshalエラー: %v", err)
		return err
	}

	length := uint32(len(data))
	// Write the length prefix
	err = binary.Write(os.Stdout, binary.LittleEndian, length)
	if err != nil {
		log.Printf("メッセージ長書き込みエラー: %v", err)
		return err
	}

	// Write the actual data
	n, err := os.Stdout.Write(data)
	if err != nil {
		log.Printf("メッセージ送信エラー: %v", err)
		return err
	}
	log.Printf("Sent %d bytes: %s", n, string(data))

	// Flush stdout to ensure the message is sent immediately
	if err := os.Stdout.Sync(); err != nil {
		log.Printf("標準出力のフラッシュエラー: %v", err)
		return err
	}

	return nil
}

// mapToStruct converts a map to a specified struct using JSON marshal/unmarshal
func mapToStruct(m map[string]interface{}, s interface{}) error {
	bytes, err := json.Marshal(m)
	if err != nil {
		return err
	}
	return json.Unmarshal(bytes, s)
}

// Ensure the loop exits gracefully on EOF
func main() {
	for {
		msg, err := ReadMessage()
		if err == io.EOF {
			log.Println("メッセージ読み取りエラー: EOF。ループを終了します。")
			break
		} else if err != nil {
			log.Printf("メッセージ読み取りエラー: %v", err)
			continue
		}
		HandleMessage(msg)
	}
	log.Println("アプリケーション終了。")
}
