<template>
<div> {{title}}</div>
</template>

<script>
import {ref} from 'vue'
export default {
setup(){
    const title=ref('myname')
    return {title}
}
}
</script>

<style>

</style>