import {EnvironmentsSdk} from 'sdk/environments-sdk';
import {inject} from 'aurelia-framework';

@inject(EnvironmentsSdk)
export class Detail {
  Name: string;
  Services: string[];

  constructor(private environmentsSdk: EnvironmentsSdk) {
    this.Name = '';
    this.Services = [];
  }

  activate(params) {
    this.Name = params.name;

    this.environmentsSdk.describeEnvironment(this.Name)
      .then(data => this.Services = data.Services);
  }
}
