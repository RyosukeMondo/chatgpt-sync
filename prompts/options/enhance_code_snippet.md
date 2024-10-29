enhance CodeTab.tsx

extract responsibility of extract code to useCodesnippet.ts
which takes html content, extract every code, try to recognize meta data of the code.

expect every code
- at least 100 characters.
- path like string in the first 4 lines ex. // Path: Z:/home/rmondo/repos/chatgpt-sync/pages/options/src/components/CodeTab.tsx
- extract file name from path like line. ex. CodeTab.tsx
- show name in stead of (code index+1) but CodeTab.tsx (Nth), if file name missing (include folder only), show code index+1.
 