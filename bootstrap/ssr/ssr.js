import { inject, unref, useSSRContext, createSSRApp, h } from "vue";
import { ssrInterpolate, ssrRenderSlot } from "vue/server-renderer";
import { createInertiaApp, Link } from "@inertiajs/vue3";
import { renderToString } from "@vue/server-renderer";
import createServer from "@inertiajs/vue3/server";
import { createPinia } from "pinia";
import { parse, stringify } from "qs";
const _sfc_main$1 = {
  __name: "Welcome",
  __ssrInlineRender: true,
  props: {
    test: String
  },
  setup(__props) {
    const route2 = inject("route");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--> keeeek <strong>${ssrInterpolate(__props.test)}</strong> ${ssrInterpolate(unref(route2)("test"))}<!--]-->`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Inertia/Pages/Welcome.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$1
}, Symbol.toStringTag, { value: "Module" }));
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Inertia/Components/Layouts/Layout.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Layout = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
class Route {
  /**
   * @param {String} name - Route name.
   * @param {Object} definition - Route definition.
   * @param {Object} config - Ziggy configuration.
   */
  constructor(name, definition, config) {
    this.name = name;
    this.definition = definition;
    this.bindings = definition.bindings ?? {};
    this.wheres = definition.wheres ?? {};
    this.config = config;
  }
  /**
   * Get a 'template' of the complete URL for this route.
   *
   * @example
   * https://{team}.ziggy.dev/user/{user}
   *
   * @return {String} Route template.
   */
  get template() {
    const template = `${this.origin}/${this.definition.uri}`.replace(/\/+$/, "");
    return template === "" ? "/" : template;
  }
  /**
   * Get a template of the origin for this route.
   *
   * @example
   * https://{team}.ziggy.dev/
   *
   * @return {String} Route origin template.
   */
  get origin() {
    return !this.config.absolute ? "" : this.definition.domain ? `${this.config.url.match(/^\w+:\/\//)[0]}${this.definition.domain}${this.config.port ? `:${this.config.port}` : ""}` : this.config.url;
  }
  /**
   * Get an array of objects representing the parameters that this route accepts.
   *
   * @example
   * [{ name: 'team', required: true }, { name: 'user', required: false }]
   *
   * @return {Array} Parameter segments.
   */
  get parameterSegments() {
    var _a;
    return ((_a = this.template.match(/{[^}?]+\??}/g)) == null ? void 0 : _a.map((segment) => ({
      name: segment.replace(/{|\??}/g, ""),
      required: !/\?}$/.test(segment)
    }))) ?? [];
  }
  /**
   * Get whether this route's template matches the given URL.
   *
   * @param {String} url - URL to check.
   * @return {Object|false} - If this route matches, returns the matched parameters.
   */
  matchesUrl(url) {
    if (!this.definition.methods.includes("GET"))
      return false;
    const pattern = this.template.replace(/(\/?){([^}?]*)(\??)}/g, (_, slash, segment, optional) => {
      var _a;
      const regex = `(?<${segment}>${((_a = this.wheres[segment]) == null ? void 0 : _a.replace(/(^\^)|(\$$)/g, "")) || "[^/?]+"})`;
      return optional ? `(${slash}${regex})?` : `${slash}${regex}`;
    }).replace(/^\w+:\/\//, "");
    const [location, query] = url.replace(/^\w+:\/\//, "").split("?");
    const matches = new RegExp(`^${pattern}/?$`).exec(decodeURI(location));
    if (matches) {
      for (const k in matches.groups) {
        matches.groups[k] = typeof matches.groups[k] === "string" ? decodeURIComponent(matches.groups[k]) : matches.groups[k];
      }
      return { params: matches.groups, query: parse(query) };
    }
    return false;
  }
  /**
   * Hydrate and return a complete URL for this route with the given parameters.
   *
   * @param {Object} params
   * @return {String}
   */
  compile(params) {
    const segments = this.parameterSegments;
    if (!segments.length)
      return this.template;
    return this.template.replace(/{([^}?]+)(\??)}/g, (_, segment, optional) => {
      if (!optional && [null, void 0].includes(params[segment])) {
        throw new Error(
          `Ziggy error: '${segment}' parameter is required for route '${this.name}'.`
        );
      }
      if (this.wheres[segment]) {
        if (!new RegExp(
          `^${optional ? `(${this.wheres[segment]})?` : this.wheres[segment]}$`
        ).test(params[segment] ?? "")) {
          throw new Error(
            `Ziggy error: '${segment}' parameter does not match required format '${this.wheres[segment]}' for route '${this.name}'.`
          );
        }
      }
      return encodeURI(params[segment] ?? "").replace(/%7C/g, "|").replace(/%25/g, "%").replace(/\$/g, "%24");
    }).replace(`${this.origin}//`, `${this.origin}/`).replace(/\/+$/, "");
  }
}
class Router extends String {
  /**
   * @param {String} [name] - Route name.
   * @param {(String|Number|Array|Object)} [params] - Route parameters.
   * @param {Boolean} [absolute] - Whether to include the URL origin.
   * @param {Object} [config] - Ziggy configuration.
   */
  constructor(name, params, absolute = true, config) {
    super();
    this._config = config ?? (typeof Ziggy !== "undefined" ? Ziggy : globalThis == null ? void 0 : globalThis.Ziggy);
    this._config = { ...this._config, absolute };
    if (name) {
      if (!this._config.routes[name]) {
        throw new Error(`Ziggy error: route '${name}' is not in the route list.`);
      }
      this._route = new Route(name, this._config.routes[name], this._config);
      this._params = this._parse(params);
    }
  }
  /**
   * Get the compiled URL string for the current route and parameters.
   *
   * @example
   * // with 'posts.show' route 'posts/{post}'
   * (new Router('posts.show', 1)).toString(); // 'https://ziggy.dev/posts/1'
   *
   * @return {String}
   */
  toString() {
    const unhandled = Object.keys(this._params).filter((key) => !this._route.parameterSegments.some(({ name }) => name === key)).filter((key) => key !== "_query").reduce((result, current) => ({ ...result, [current]: this._params[current] }), {});
    return this._route.compile(this._params) + stringify(
      { ...unhandled, ...this._params["_query"] },
      {
        addQueryPrefix: true,
        arrayFormat: "indices",
        encodeValuesOnly: true,
        skipNulls: true,
        encoder: (value, encoder) => typeof value === "boolean" ? Number(value) : encoder(value)
      }
    );
  }
  /**
   * Get the parameters, values, and metadata from the given URL.
   *
   * @param {String} [url] - The URL to inspect, defaults to the current window URL.
   * @return {{ name: string, params: Object, query: Object, route: Route }}
   */
  _unresolve(url) {
    if (!url) {
      url = this._currentUrl();
    } else if (this._config.absolute && url.startsWith("/")) {
      url = this._location().host + url;
    }
    let matchedParams = {};
    const [name, route2] = Object.entries(this._config.routes).find(
      ([name2, route3]) => matchedParams = new Route(name2, route3, this._config).matchesUrl(url)
    ) || [void 0, void 0];
    return { name, ...matchedParams, route: route2 };
  }
  _currentUrl() {
    const { host, pathname, search } = this._location();
    return (this._config.absolute ? host + pathname : pathname.replace(this._config.url.replace(/^\w*:\/\/[^/]+/, ""), "").replace(/^\/+/, "/")) + search;
  }
  /**
   * Get the name of the route matching the current window URL, or, given a route name
   * and parameters, check if the current window URL and parameters match that route.
   *
   * @example
   * // at URL https://ziggy.dev/posts/4 with 'posts.show' route 'posts/{post}'
   * route().current(); // 'posts.show'
   * route().current('posts.index'); // false
   * route().current('posts.show'); // true
   * route().current('posts.show', { post: 1 }); // false
   * route().current('posts.show', { post: 4 }); // true
   *
   * @param {String} [name] - Route name to check.
   * @param {(String|Number|Array|Object)} [params] - Route parameters.
   * @return {(Boolean|String|undefined)}
   */
  current(name, params) {
    const { name: current, params: currentParams, query, route: route2 } = this._unresolve();
    if (!name)
      return current;
    const match = new RegExp(`^${name.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(
      current
    );
    if ([null, void 0].includes(params) || !match)
      return match;
    const routeObject = new Route(current, route2, this._config);
    params = this._parse(params, routeObject);
    const routeParams = { ...currentParams, ...query };
    if (Object.values(params).every((p) => !p) && !Object.values(routeParams).some((v) => v !== void 0))
      return true;
    return Object.entries(params).every(([key, value]) => routeParams[key] == value);
  }
  /**
   * Get an object representing the current location (by default this will be
   * the JavaScript `window` global if it's available).
   *
   * @return {Object}
   */
  _location() {
    var _a, _b, _c;
    const {
      host = "",
      pathname = "",
      search = ""
    } = typeof window !== "undefined" ? window.location : {};
    return {
      host: ((_a = this._config.location) == null ? void 0 : _a.host) ?? host,
      pathname: ((_b = this._config.location) == null ? void 0 : _b.pathname) ?? pathname,
      search: ((_c = this._config.location) == null ? void 0 : _c.search) ?? search
    };
  }
  /**
   * Get all parameter values from the current window URL.
   *
   * @example
   * // at URL https://tighten.ziggy.dev/posts/4?lang=en with 'posts.show' route 'posts/{post}' and domain '{team}.ziggy.dev'
   * route().params; // { team: 'tighten', post: 4, lang: 'en' }
   *
   * @return {Object}
   */
  get params() {
    const { params, query } = this._unresolve();
    return { ...params, ...query };
  }
  /**
   * Check whether the given route exists.
   *
   * @param {String} name
   * @return {Boolean}
   */
  has(name) {
    return Object.keys(this._config.routes).includes(name);
  }
  /**
   * Parse Laravel-style route parameters of any type into a normalized object.
   *
   * @example
   * // with route parameter names 'event' and 'venue'
   * _parse(1); // { event: 1 }
   * _parse({ event: 2, venue: 3 }); // { event: 2, venue: 3 }
   * _parse(['Taylor', 'Matt']); // { event: 'Taylor', venue: 'Matt' }
   * _parse([4, { uuid: 56789, name: 'Grand Canyon' }]); // { event: 4, venue: 56789 }
   *
   * @param {(String|Number|Array|Object)} params - Route parameters.
   * @param {Route} route - Route instance.
   * @return {Object} Normalized complete route parameters.
   */
  _parse(params = {}, route2 = this._route) {
    params ?? (params = {});
    params = ["string", "number"].includes(typeof params) ? [params] : params;
    const segments = route2.parameterSegments.filter(({ name }) => !this._config.defaults[name]);
    if (Array.isArray(params)) {
      params = params.reduce(
        (result, current, i) => segments[i] ? { ...result, [segments[i].name]: current } : typeof current === "object" ? { ...result, ...current } : { ...result, [current]: "" },
        {}
      );
    } else if (segments.length === 1 && !params[segments[0].name] && (params.hasOwnProperty(Object.values(route2.bindings)[0]) || params.hasOwnProperty("id"))) {
      params = { [segments[0].name]: params };
    }
    return {
      ...this._defaults(route2),
      ...this._substituteBindings(params, route2)
    };
  }
  /**
   * Populate default parameters for the given route.
   *
   * @example
   * // with default parameters { locale: 'en', country: 'US' } and 'posts.show' route '{locale}/posts/{post}'
   * defaults(...); // { locale: 'en' }
   *
   * @param {Route} route
   * @return {Object} Default route parameters.
   */
  _defaults(route2) {
    return route2.parameterSegments.filter(({ name }) => this._config.defaults[name]).reduce(
      (result, { name }, i) => ({ ...result, [name]: this._config.defaults[name] }),
      {}
    );
  }
  /**
   * Substitute Laravel route model bindings in the given parameters.
   *
   * @example
   * _substituteBindings({ post: { id: 4, slug: 'hello-world', title: 'Hello, world!' } }, { bindings: { post: 'slug' } }); // { post: 'hello-world' }
   *
   * @param {Object} params - Route parameters.
   * @param {Object} route - Route definition.
   * @return {Object} Normalized route parameters.
   */
  _substituteBindings(params, { bindings, parameterSegments }) {
    return Object.entries(params).reduce((result, [key, value]) => {
      if (!value || typeof value !== "object" || Array.isArray(value) || !parameterSegments.some(({ name }) => name === key)) {
        return { ...result, [key]: value };
      }
      if (!value.hasOwnProperty(bindings[key])) {
        if (value.hasOwnProperty("id")) {
          bindings[key] = "id";
        } else {
          throw new Error(
            `Ziggy error: object passed as '${key}' parameter is missing route model binding key '${bindings[key]}'.`
          );
        }
      }
      return { ...result, [key]: value[bindings[key]] };
    }, {});
  }
  valueOf() {
    return this.toString();
  }
  /**
   * @deprecated since v1.0, use `has()` instead.
   */
  check(name) {
    return this.has(name);
  }
}
class ZiggyRouter extends Router {
  constructor(name, params, absolute = true, config) {
    super();
    this._config = config ?? (typeof Ziggy !== "undefined" ? Ziggy : globalThis == null ? void 0 : globalThis.Ziggy);
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
class ZiggyRoute extends Route {
  get template() {
    const template = `${this.origin}/${this.definition.uri}`.replace(/\/+$/, "") + "/";
    return template === "" ? "/" : template;
  }
}
function route(name, params, absolute, config) {
  const router = new ZiggyRouter(name, params, absolute, config);
  return name ? router.toString() : router;
}
const ZiggyVue = {
  install(app, options) {
    const r = (name, params, absolute, config = options) => route(name, params, absolute, config);
    app.mixin({
      methods: {
        route: r
      }
    });
    if (parseInt(app.version) > 2) {
      app.provide("route", r);
    }
  }
};
const pinia = createPinia();
createServer(
  (page) => createInertiaApp({
    page,
    render: renderToString,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/Welcome.vue": __vite_glob_0_0 });
      let page2 = pages[`./Pages/${name}.vue`];
      page2.default.layout = page2.default.layout || Layout;
      return pages[`./Pages/${name}.vue`];
    },
    setup({ App, props, plugin }) {
      const app = createSSRApp({
        render: () => h(App, props)
      });
      const pageProps = props.initialPage.props;
      app.use(plugin).use(ZiggyVue, pageProps.routes).use(pinia).component("inertia-link", Link);
      return app;
    }
  })
);
