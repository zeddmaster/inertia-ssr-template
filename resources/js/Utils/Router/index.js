import {ZiggyRouter} from "./Router";

export default function route(name, params, absolute, config) {
  const router = new ZiggyRouter(name, params, absolute, config);

  return name ? router.toString() : router;
}

export const ZiggyVue = {
  install(app, options) {
    const r = (name, params, absolute, config = options) =>
      route(name, params, absolute, config);

    app.mixin({
      methods: {
        route: r
      },
    });

    if (parseInt(app.version) > 2) {
      app.provide('route', r);
    }
  },
};
