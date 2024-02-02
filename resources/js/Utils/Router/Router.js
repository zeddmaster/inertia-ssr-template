import Router from 'ziggy/Router'
import Route from 'ziggy/Route'

export class ZiggyRouter extends Router
{
  constructor(name, params, absolute = true, config) {
    super();

    this._config = config ?? (typeof Ziggy !== 'undefined' ? Ziggy : globalThis?.Ziggy);
    this._config = { ...this._config, absolute };

    if (name) {
      if (!this._config.routes[name]) {
        throw new Error(`Ziggy error: route '${name}' is not in the route list.`);
      }

      this._route = new ZiggyRoute(name, this._config.routes[name], this._config);
      this._params = this._parse(params);
    }
  }
}

export class ZiggyRoute extends Route
{
  get template() {
    const template = `${this.origin}/${this.definition.uri}`.replace(/\/+$/, '') + '/';

    return template === '' ? '/' : template;
  }
}
