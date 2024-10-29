package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
)

type Message struct {
	Path string `json:"path"`
	Code string `json:"code"`
}

// Initialize logger
func initLogger() (*os.File, error) {
	logFilePath := "./log.txt"
	logFile, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to open log file %s: %v", logFilePath, err)
	}

	// Set log output and format
	log.SetOutput(logFile)
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	log.Println("Logger initialized.")
	return logFile, nil
}

func readMessage() (Message, error) {
	var msg Message
	reader := bufio.NewReader(os.Stdin)

	// Read the 4-byte message length
	var lengthBytes [4]byte
	_, err := reader.Read(lengthBytes[:])
	if err != nil {
		log.Printf("Error reading message length: %v", err)
		return msg, err
	}

	length := int(lengthBytes[0]) | int(lengthBytes[1])<<8 | int(lengthBytes[2])<<16 | int(lengthBytes[3])<<24
	log.Printf("Message length: %d bytes", length)

	// Read the message content
	messageBytes := make([]byte, length)
	_, err = reader.Read(messageBytes)
	if err != nil {
		log.Printf("Error reading message content: %v", err)
		return msg, err
	}

	err = json.Unmarshal(messageBytes, &msg)
	if err != nil {
		log.Printf("Error unmarshalling message: %v", err)
		return msg, err
	}

	log.Printf("Received message: Path=%s, Code length=%d", msg.Path, len(msg.Code))
	return msg, nil
}

func sendMessage(response interface{}) error {
	responseBytes, err := json.Marshal(response)
	if err != nil {
		log.Printf("Error marshalling response: %v", err)
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
		log.Printf("Error writing response length: %v", err)
		return err
	}
	_, err = os.Stdout.Write(responseBytes)
	if err != nil {
		log.Printf("Error writing response content: %v", err)
		return err
	}

	log.Printf("Sent response: %s", string(responseBytes))
	return nil
}

func saveToFile(path string, code string) error {
	// Ensure the directory exists
	dir := filepath.Dir(path)
	err := os.MkdirAll(dir, os.ModePerm)
	if err != nil {
		log.Printf("Error creating directories for path %s: %v", path, err)
		return err
	}

	// Write the code to the file
	err = ioutil.WriteFile(path, []byte(code), 0644)
	if err != nil {
		log.Printf("Error writing to file %s: %v", path, err)
		return err
	}

	log.Printf("Successfully saved file: %s", path)
	return nil
}

func main() {
	// Initialize logger
	logFile, err := initLogger()
	if err != nil {
		// If logging fails, print to stderr and exit
		fmt.Fprintf(os.Stderr, "Failed to initialize logger: %v\n", err)
		os.Exit(1)
	}
	defer func() {
		log.Println("Shutting down logger.")
		logFile.Close()
	}()

	log.Println("Application started.")

	for {
		msg, err := readMessage()
		if err != nil {
			log.Printf("Error reading message: %v. Exiting loop.", err)
			// Optionally, you can send an error response before exiting
			sendMessage(map[string]string{
				"status":  "error",
				"message": fmt.Sprintf("Failed to read message: %v", err),
			})
			break
		}

		if msg.Path == "" || msg.Code == "" {
			log.Println("Received message with empty Path or Code.")
			err = sendMessage(map[string]string{
				"status":  "error",
				"message": "Path or code is empty.",
			})
			if err != nil {
				log.Printf("Failed to send error message: %v", err)
			}
			continue
		}

		log.Printf("Processing message for Path: %s", msg.Path)
		err = saveToFile(msg.Path, msg.Code)
		if err != nil {
			log.Printf("Failed to save file: %v", err)
			err = sendMessage(map[string]string{
				"status":  "error",
				"message": fmt.Sprintf("Failed to save file: %v", err),
			})
			if err != nil {
				log.Printf("Failed to send error message: %v", err)
			}
			continue
		}

		err = sendMessage(map[string]string{
			"status":  "success",
			"message": "File saved successfully.",
		})
		if err != nil {
			log.Printf("Failed to send success message: %v", err)
		}
	}

	log.Println("Application terminated.")
}
