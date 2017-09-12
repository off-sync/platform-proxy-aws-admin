import {ClustersSdk} from 'sdk/clusters-sdk';
import {inject} from 'aurelia-framework';

@inject(ClustersSdk)
export class ClusterDashboard {
  clusters: string[];

  constructor(private clustersSdk: ClustersSdk) {
    this.clusters = [];
  }

  activate(params) {
    this.clustersSdk.listClusters()
      .then(clusters => this.clusters = clusters);
  }
}
