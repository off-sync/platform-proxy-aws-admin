import {EnvironmentsSdk} from '../sdk/environments-sdk';
import {inject} from 'aurelia-framework';

class Service {
  constructor(
    public Name: string,
    public Type: string,
    public ServerURLs: string) {
  }
}

@inject(EnvironmentsSdk)
export class Detail {
  Name: string;
  Services: Service[];

  constructor(private environmentsSdk: EnvironmentsSdk) {
    this.Name = '';
    this.Services = [];
  }

  activate(params) {
    this.Name = params.name;

    this.environmentsSdk
      .describeEnvironment(this.Name)
      .then(data => {
        this.Services = data.Services.map(name => new Service(name, "unsupported", null));
        data.Services.forEach(name => this.describeService(name));
      });
  }

  describeService(serviceName: string) {
    return this.environmentsSdk
      .describeService(this.Name, serviceName)
      .then(service => {
        for (var i = 0 ; i < this.Services.length; i++) {
          if (this.Services[i].Name == service.Name ) {
            this.Services[i].Type = service.Type;
            this.Services[i].ServerURLs = service.ServerURLs;
          }
        }
      });
  }
}
