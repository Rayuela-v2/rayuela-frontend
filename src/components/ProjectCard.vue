<script setup>
import {sliceTextAt} from "../utils/textUtils";
import Project from "@/components/TheProject.vue";
import {ref} from "vue";

let showId = ref(null);

defineProps(['project'])
</script>

<template>
  <div class="card" @click="showId = project.id">
    <div>
      <figure class="image is-4by3">
        <img :src="project.image" alt="Project image">
      </figure>
    </div>
    <div class="card-content">
      <div class="title is-6">
        <div class="text">
          {{ sliceTextAt(project.name, 10) }}
        </div>
      </div>
      <div class="content text">
        <div>
          {{ sliceTextAt(project.description, 25) }}
        </div>
      </div>
    </div>
  </div>
  <Project :show="showId === project.id" :name="project.name" :web="project.web" :image="project.image"
           :description="project.description" @close="showId=null">
  </Project>
</template>

<style>
.card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  width: 10em;
  margin: 8px;
}

.image img {
  object-fit: cover;
  width: 100%;
  height: auto;
}

.card-content {
  padding: 1rem;
}

.title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}
</style>
