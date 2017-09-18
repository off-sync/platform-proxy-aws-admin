export class App {
  private router;

  title = 'Off-Sync.com Platform Proxy Admin for AWS';
  message = 'Hello World!';

  configureRouter(config, router) {
    this.router = router;

    config.title = this.title;
    config.map([
      { route: ['', 'environments'], name: 'environments', moduleId: 'environments/index', title: 'Environments', nav: true },
      { route: 'environments/:name', name: 'environmentDetail', moduleId: 'environments/detail' },
      { route: 'environments/:environmentName/services/:serviceName', name: 'serviceDetail', moduleId: 'services/detail' },
      { route: 'environments/:environmentName/services/:serviceName/delete', name: 'serviceDelete', moduleId: 'services/detail' },
    ]);
  }
}
