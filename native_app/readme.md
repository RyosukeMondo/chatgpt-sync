# how to install

## install extension

get app id

## install native app

save native app to local

## update com.your_company.chatgpt_sync.json

path : native app path
chrome-extension : app id

{
  "name": "com.your_company.chatgpt_sync",
  "description": "ChatGPT Sync Native Messaging Host",
  "path": "D:\\repos\\chatgpt-sync\\native_app\\chatgpt_sync_native_app.exe",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://pcejgppplmlmcpjojamefaddlnlaijgh/"
  ]
}

save to below for default user in chrome.

%AppData%\..\Local\Google\Chrome\User Data\Default\NativeMessagingHosts

## setup

set path in chrome option page point to native app

## how to build

```
cd chatgpt-sync/native_app
go build -o chatgpt_sync_native_app.exe
```
