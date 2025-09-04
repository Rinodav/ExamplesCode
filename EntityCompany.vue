<template>
  <div class="entity-company">
    <div class="entity-company__content card flex flex-col gap-4 p-4">
      <div class="flex justify-between items-center">
        <div class="content__title" v-if="isEditing">
          <InputText
            v-model="title"
            class="input-text text-2xl font-bold w-full"
            autoResize
            rows="2"
          />
        </div>
        <h2 v-else class="company-detail__title text-2xl font-bold w-full">
          {{ companiesStore.loading ? "Загрузка..." : title }}
        </h2>
        <div class="flex gap-3">
          <ConfirmDeleteButton
            :on-confirm="deleteCompany"
            message="Удалить эту компанию?"
            :loading="companiesStore.loading"
          />
          <div class="flex justify-center items-center">
            <Button
              :label="isEditing ? 'Сохранить' : 'Редактировать'"
              @click="toggleEdit"
              class="ml-4"
              severity="secondary"
              :loading="companiesStore.loading"
            />
          </div>
        </div>
      </div>

      <div v-if="isEditing">
        <Textarea v-model="content" rows="10" class="w-full" />
      </div>
      <p v-else class="whitespace-pre-line">
        {{ companiesStore.loading ? "Загрузка..." : content }}
      </p>
    </div>
  </div>
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { useCompaniesStore } from "@/stores/сompaniesStore";
import { useRouter, useRoute } from "vue-router";
import "primeicons/primeicons.css";
import ConfirmDeleteButton from "@/components/ui/modals/ConfirmDeleteButton.vue";
import ConfirmDialog from "primevue/confirmdialog";

const route = useRoute();
const router = useRouter();
const companyId = ref(String(route.params.id));
const companiesStore = useCompaniesStore();
const isEditing = ref(false);
const title = ref("");
const content = ref("");

onMounted(async () => {
  const data = await companiesStore.fetchCompanyById(companyId.value);
  if (data) {
    title.value = data.name;
    content.value = data.description;
  }
});

async function toggleEdit() {
  if (isEditing.value) {
    const updated = {
      name: title.value,
      description: content.value,
    };

    await companiesStore.updateCompany(companyId.value, updated);
  }
  isEditing.value = !isEditing.value;
}

const deleteCompany = async () => {
  await companiesStore.deleteCompany(+companyId.value);
  router.push("/dashboard/");
};
</script>

<style lang="scss" scoped>
.entity-company {
  &__content {
    Button {
      background-color: $accent-color;
      color: $text-color;
      padding: 10px 30px;
    }

    .input-text {
      font-size: $font-l;
      width: 100%;
      max-width: 500px;
      word-wrap: break-word;
    }
  }
}
</style>
