package main

import (
	"io"
	"net/http"
)

func main() {
	http.HandleFunc("/ping", pong)
	http.HandleFunc("/video", serveVideo)

	http.ListenAndServe(":8080", nil)
}

func pong(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	io.WriteString(w, "Pong!")
}

func serveVideo(w http.ResponseWriter, req *http.Request) {
	// w.Header().Set("Content-Type", "text/html; charset=utf-8")
	enableCors(&w)
	http.ServeFile(w, req, "../assets/Video.mp4")
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}
