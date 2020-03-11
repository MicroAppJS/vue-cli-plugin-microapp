import Vue from 'vue';

const TEMP = [ 'a', 'b' ];
const app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        objccccc: {
            ... {
                c: 'abc',
            },
        },
    },
    methods: {
        handleClick() {
            console.warn('click...', [
                ...TEMP,
            ]);
            this.message = this.message + 1;
        },
    },
});

console.warn('main...');
