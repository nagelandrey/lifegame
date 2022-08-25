<template>
  <router-view>
  <MainField />
  </router-view>
</template>

<script>
import MainField from "@/components/MainField";
export default {
  name: "MainPage",
  components: {MainField},
}
</script>

<style scoped>

</style>