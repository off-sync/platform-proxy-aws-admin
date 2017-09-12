import {HttpClient} from 'aurelia-fetch-client';

export class ClustersSdk {
  private httpClient: HttpClient

  constructor() {
    this.httpClient = new HttpClient();

    this.httpClient.configure(config => {
      config.withDefaults({
        headers: {
          'Accept': 'application/json'
        }});

      config.baseUrl = "http://localhost:8080/";
    });
  }

  listClusters() {
    return this.httpClient
      .fetch("api/clusters")
      .then(response => response.json())
      .then(data => data.Clusters);
  }
}
