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
    if (!ok) {
        return nil, fmt.Errorf("invalid message format")
    }

    switch kind {
    case "SAVE_TO_PATH":
        var req SaveToPathRequest
        if err := mapToStruct(raw, &req); err != nil {
            return nil, err
        }
        return req, nil
    // 他のケースを追加
    default:
        return nil, fmt.Errorf("不明なメッセージ種別: %s", kind)
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