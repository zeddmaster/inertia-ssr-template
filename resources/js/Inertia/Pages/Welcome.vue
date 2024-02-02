<script setup>
import {inject} from "vue";

const props = defineProps({
    test: String
})

const route = inject('route')

</script>

<template>
    {{ route('test') }}
</template>

<style scoped>

</style>
