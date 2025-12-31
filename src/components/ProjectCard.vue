<script setup>
import {sliceTextAt} from "@/utils/textUtils";
import {ref} from "vue";

let showId = ref(null);

defineProps(['project'])

</script>

<template>
  <v-dialog max-width="700">
    <template v-slot:activator="{ props: activatorProps }">
      <div class="card" v-bind="activatorProps" @click="showId = project.id">
        <div>
          <figure class="image is-4by3">
            <img :src="project.image" :alt="$t('common.image_alt')">
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
    </template>

    <template v-slot:default="{ isActive }">
      <v-card :title="project.name">
        <v-img
            height="200"
            aspect-ratio="16/9"
            cover
            :src="project.image" :alt="project.name"
        ></v-img>
        <v-card-text>
          {{ project.description}}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
           <v-btn
              :text="$t('common.close')"
              @click="isActive.value = false"
          ></v-btn>
          <v-btn
              variant="tonal"
              append-icon="fa-solid fa-share"
              :text="$t('project.visit_website')"
              :href="project.web"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
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
