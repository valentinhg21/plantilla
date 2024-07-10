
import { navbar } from './utils/header.js';
import { select } from './utils/select.js';
import { transition } from './utils/transition.js';

window.addEventListener('DOMContentLoaded', () => {
    try {
        transition();
        navbar();
        select();

    } catch (error) {
        console.error(error)
    }
});