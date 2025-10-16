import { ref } from 'vue';

const isLoading = ref(false);

export const loadingService = {
    get isLoading() {
        return isLoading.value;
    },
    show() {
        isLoading.value = true;
    },
    hide() {
        isLoading.value = false;
    },
};
