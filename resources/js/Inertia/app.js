import { createApp, h } from 'vue'
import {createInertiaApp, Link as InertiaLink} from '@inertiajs/vue3'
import {createPinia} from "pinia";
import {ZiggyVue} from "../Utils/Router/index.js";

import Layout from "./Components/Layouts/Layout.vue";

const pinia = createPinia()

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.vue', {eager: true})
        let page = pages[`./Pages/${name}.vue`]
        page.default.layout = page.default.layout || Layout
        return pages[`./Pages/${name}.vue`]
    },
    setup({ el, App, props, plugin }) {
        const app = createApp({ render: () => h(App, props) })

        const pageProps = props.initialPage.props

        app.use(plugin)
            .use(ZiggyVue, pageProps.routes)
            .use(pinia)
            .component('inertia-link', InertiaLink)

        app.use(plugin)
            .mount(el)
    },
})
