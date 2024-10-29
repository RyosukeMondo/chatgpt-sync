package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
)

type Message struct {
	Path string `json:"path"`
	Code string `json:"code"`
}

func readMessage() (Message, error) {
	var msg Message
	reader := bufio.NewReader(os.Stdin)

	// Read the 4-byte message length
	var lengthBytes [4]byte
	_, err := reader.Read(lengthBytes[:])
	if err != nil {
		return msg, err
	}

	length := int(lengthBytes[0]) | int(lengthBytes[1])<<8 | int(lengthBytes[2])<<16 | int(lengthBytes[3])<<24

	// Read the message content
	messageBytes := make([]byte, length)
	_, err = reader.Read(messageBytes)
	if err != nil {
		return msg, err
	}

	err = json.Unmarshal(messageBytes, &msg)
	return msg, err
}

func sendMessage(response interface{}) error {
	responseBytes, err := json.Marshal(response)
	if err != nil {
		return err
	}

	length := len(responseBytes)
	lengthBytes := []byte{
		byte(length & 0xFF),
		byte((length >> 8) & 0xFF),
		byte((length >> 16) & 0xFF),
		byte((length >> 24) & 0xFF),
	}

	// Write the length and message
	_, err = os.Stdout.Write(lengthBytes)
	if err != nil {
		return err
	}
	_, err = os.Stdout.Write(responseBytes)
	return err
}

func saveToFile(path string, code string) error {
	// Ensure the directory exists
	dir := filepath.Dir(path)
	err := os.MkdirAll(dir, os.ModePerm)
	if err != nil {
		return err
	}

	// Write the code to the file
	return ioutil.WriteFile(path, []byte(code), 0644)
}

func main() {
	for {
		msg, err := readMessage()
		if err != nil {
			// If there's an error reading, exit
			break
		}

		if msg.Path == "" || msg.Code == "" {
			sendMessage(map[string]string{
				"status":  "error",
				"message": "Path or code is empty.",
			})
			continue
		}

		err = saveToFile(msg.Path, msg.Code)
		if err != nil {
			sendMessage(map[string]string{
				"status":  "error",
				"message": fmt.Sprintf("Failed to save file: %v", err),
			})
			continue
		}

		sendMessage(map[string]string{
			"status":  "success",
			"message": "File saved successfully.",
		})
	}
}