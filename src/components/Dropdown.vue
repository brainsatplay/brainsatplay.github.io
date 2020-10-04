<template>
    <div
            class="dropdown is-right"
            v-bind:class="{ 'is-active': isDropdownActive }"
            v-on-clickaway="away"
    >
        <div
                class="dropdown-trigger"
                @click="isDropdownActive=!isDropdownActive"
        >
            <a
                    aria-haspopup="true"
                    aria-controls="{ 'dropdown-menu'}"
            >
                <span>More</span>
                <span class="icon is-small">
          <i
                  class="fa fa-angle-down"
                  aria-hidden="true"
          ></i>
        </span>
            </a>
        </div>
        <div
                class="dropdown-menu"
                id="dropdown-menu"
                role="menu"
        >
            <div class="dropdown-content">
                <a
                        href="#"
                        class="dropdown-item has-text-centered"
                >
                    <span>Some Action</span>
                </a>
            </div>
        </div>
    </div>
</template>
<script>
    import { mixin as clickaway } from 'vue-clickaway';
    export default {
        props: ['id'],
        mixins: [ clickaway ],
        data() {
            return {
                isDropdownActive: false,
            }
        },
        methods: {
            away() {
                this.isDropdownActive = false;
            }
        }
    };
</script>
<style scoped>
</style>
