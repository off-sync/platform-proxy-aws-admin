package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

type listEnvironments struct {
	Environments []string
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/api/environments", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")

		listEnvironments := &listEnvironments{
			Environments: []string{"off-sync-qa", "off-sync-live"},
		}

		json.NewEncoder(w).Encode(listEnvironments)
	})

	r.PathPrefix("/scripts/").Handler(http.StripPrefix("/scripts", http.FileServer(http.Dir("scripts"))))

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	http.ListenAndServe(":8080", r)
}
