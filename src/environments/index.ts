import {EnvironmentsSdk} from '../sdk/environments-sdk';
import {inject} from 'aurelia-framework';

@inject(EnvironmentsSdk)
export class Index {
  environments: string[];

  constructor(private environmentsSdk: EnvironmentsSdk) {
    this.environments = [];
  }

  activate(params) {
    this.environmentsSdk.listEnvironment()
      .then(environments => this.environments = environments);
  }
}
