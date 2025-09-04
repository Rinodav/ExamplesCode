<template>
  <div class="login">
    <div class="login__content">
      <h2 class="text-xl">Вход</h2>
      <Form @submit="onFormSubmit">
        <div>
          <InputText
            type="text"
            placeholder="Логин"
            v-model="username"
            :class="{ 'p-invalid': usernameMeta?.touched && usernameError }"
            fluid
            autocomplete="username"
            @blur="usernameHandleBlur"
          />
          <Message
            v-if="usernameMeta?.touched && usernameError"
            severity="error"
            size="small"
            variant="simple"
            >{{ usernameError }}</Message
          >
        </div>

        <div>
          <Password
            id="password"
            placeholder="Пароль"
            :feedback="false"
            toggleMask
            fluid
            v-model="password"
            :class="{ 'p-invalid': passwordMeta?.touched && passwordError }"
            @blur="passwordHandleBlur"
          />
          <Message
            v-if="passwordMeta?.touched && passwordError"
            severity="error"
            size="small"
            variant="simple"
            >{{ passwordError }}</Message
          >
        </div>
        <div>
          <Button
            type="submit"
            severity="secondary"
            :label="authStore.getLoading ? 'Вход...' : 'Войти'"
            :disabled="authStore.getLoading"
            fluid
          />
          <Message
            v-if="authStore.getError"
            severity="error"
            size="small"
            variant="simple"
            >{{ authStore.getError }}
          </Message>
        </div>
        <p class="is-login">
          У вас нет учетной записи?
          <router-link to="/register">Зарегистрироваться</router-link>
        </p>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthFlow } from "@/composables/useAuthFlow";
import type { LoginPayload, FormValues } from "@/types/auth.types";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Message from "primevue/message";
import Button from "primevue/button";
import { Form } from "vee-validate";
import { useField, useForm } from "vee-validate";
import { useAuthValidationSchemas } from "@/composables/useAuthValidationSchemas";

const { loginFormResolver } = useAuthValidationSchemas();
const { authStore } = useAuthFlow(false, "/dashboard");
const router = useRouter();

const {
  handleSubmit,
  errors,
  meta: formMeta,
} = useForm({
  validationSchema: loginFormResolver,
  initialValues: {
    username: "",
    password: "",
  },
});

const {
  value: username,
  errorMessage: usernameError,
  meta: usernameMeta,
  handleBlur: usernameHandleBlur,
} = useField<string>("username");
const {
  value: password,
  errorMessage: passwordError,
  meta: passwordMeta,
  handleBlur: passwordHandleBlur,
} = useField<string>("password");

const onFormSubmit: any = handleSubmit(async (values: LoginPayload) => {
  await authStore.login(values);
});

onMounted(() => {
  authStore.resetAuthStatus();
});
</script>

<style lang="scss" scoped>
.login {
  &__content {
    max-width: 450px;
    width: 100%;
    padding: 0 1.5rem;
    margin: 60px auto 0;
    transform-origin: top center;
    transition-duration: 1s;
    h2 {
      font-size: clamp($font-m, $font-2xl, $font-3xl);
      text-align: center;
    }
    Form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 30px;
      .p-message {
        margin-top: 5px;
      }
      Button {
        background-color: $accent-color;
        color: $text-color;
        padding: 15px 0;
      }
    }
    .is-login {
      text-align: center;
      margin-top: 10px;
      font-size: $font-s;
      a {
        text-decoration: none;
        color: $accent-color;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
  @media (min-width: $width-tablet) {
    &__content {
      transform: scale(1);
    }
  }
  @media (min-width: $width-desktop) {
    &__content {
      transform: scale(1.1);
    }
  }
  @media (min-width: $width-wide) {
    &__content {
      transform: scale(1.2);
    }
  }
}
</style>
