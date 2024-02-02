import {createSSRApp, h} from 'vue'
import {createInertiaApp, Link as InertiaLink} from '@inertiajs/vue3'
import {renderToString} from '@vue/server-renderer'
import createServer from '@inertiajs/vue3/server'
import Layout from "./Components/Layouts/Layout.vue";


import {createPinia} from "pinia";
import {ZiggyVue} from "../Utils/Router/index.js";

const pinia = createPinia()

createServer(page =>
    createInertiaApp({
        page,
        render: renderToString,

        resolve: name => {
            const pages = import.meta.glob('./Pages/**/*.vue', {eager: true})
            let page = pages[`./Pages/${name}.vue`]
            page.default.layout = page.default.layout || Layout
            return pages[`./Pages/${name}.vue`]
        },

        setup({App, props, plugin}) {
            const app = createSSRApp({
                render: () => h(App, props),
            })

            const pageProps = props.initialPage.props

            app.use(plugin)
                .use(ZiggyVue, pageProps.routes)
                .use(pinia)
                .component('inertia-link', InertiaLink)

            return app
        },
    }),
)
