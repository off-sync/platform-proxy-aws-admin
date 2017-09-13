package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"

	"github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	homedir "github.com/mitchellh/go-homedir"
	"github.com/off-sync/platform-proxy-aws/common"
	"github.com/off-sync/platform-proxy-aws/infra"
	"github.com/off-sync/platform-proxy-aws/services"
	"github.com/spf13/viper"
)

var cfgFile string
var logger *logrus.Logger

type listEnvironments struct {
	Environments []string
}

type describeEnvironment struct {
	Services []string
}

func init() {
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find home directory.
		home, err := homedir.Dir()
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		// Search config in home directory with name ".platform-proxy-aws-admin" (without extension).
		viper.AddConfigPath(home)
		viper.SetConfigName(".platform-proxy-aws-admin")
	}

	viper.SetEnvPrefix("PLATFORM_PROXY_AWS_ADMIN")
	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	}

	logLevel := viper.GetString("logLevel")

	l, err := logrus.ParseLevel(logLevel)
	if err != nil {
		fmt.Printf("Invalid log level '%s': using default log level 'Info'", logLevel)
		l = logrus.InfoLevel
	}

	logger = logrus.New()
	logger.Level = l

	if viper.GetBool("logJSON") {
		logger.Formatter = &logrus.JSONFormatter{}
	}
}

func main() {
	ecsAPI, err := infra.NewAwsEcsSdkFromConfig(viper.GetViper())
	sqsAPI, err := infra.NewAwsSqsSdkFromConfig(viper.GetViper())

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	serviceWatcher, err := common.NewSqsWatcher(ctx, sqsAPI, viper.GetString("servicesQueueName"))
	if err != nil {
		logger.WithError(err).Fatal("creating service watcher")
		return
	}

	serviceRepository, err := services.NewServiceRepository(ecsAPI, serviceWatcher)
	if err != nil {
		logger.WithError(err).Fatal("creating service repository")
		return
	}

	r := mux.NewRouter()

	r.HandleFunc("/api/environments", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")

		listEnvironments := &listEnvironments{
			Environments: []string{"off-sync-qa", "off-sync-live"},
		}

		json.NewEncoder(w).Encode(listEnvironments)
	})

	r.HandleFunc("/api/environments/{name}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")

		services, err := serviceRepository.ListServices()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		describeEnvironment := &describeEnvironment{
			Services: services,
		}

		json.NewEncoder(w).Encode(describeEnvironment)
	})

	r.PathPrefix("/scripts/").Handler(http.StripPrefix("/scripts", http.FileServer(http.Dir("scripts"))))

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	go func() {
		http.ListenAndServe(":8080", r)
	}()

	// wait for SIGINT
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c

	// cancel the context to trigger the cleanup process
	cancel()
}
