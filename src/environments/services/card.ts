import {bindable, containerless, inject} from 'aurelia-framework';

import {Service} from './service';
import {EnvironmentsSdk} from '../../sdk/environments-sdk';

@containerless
@inject(EnvironmentsSdk)
export class Card {
  @bindable EnvironmentName: string;
  @bindable ServiceName: string;

  Service: Service;

  constructor(private environmentsSdk: EnvironmentsSdk) {
  }

  bind() {
    console.log(this.EnvironmentName, this.ServiceName);

    this.environmentsSdk
      .describeService(this.EnvironmentName, this.ServiceName)
      .then(data => this.Service = data);
  }
}
