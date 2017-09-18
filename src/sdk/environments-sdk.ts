import {HttpClient} from 'aurelia-fetch-client';

export class EnvironmentsSdk {
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

  listEnvironment() {
    return this.httpClient
      .fetch("api/environments")
      .then(response => response.json())
      .then(data => data.Environments);
  }

  describeEnvironment(name: string) {
    return this.httpClient
      .fetch("api/environments/" + name)
      .then(response => response.json());
  }

  describeService(environmentName: string, serviceName: string) {
    return this.httpClient
      .fetch("api/environments/" + environmentName + "/services/" + serviceName)
      .then(response => response.json());
  }
}
