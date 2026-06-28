import { nabh } from './nabh.js';

document.addEventListener("DOMContentLoaded", () => {
    const themebtn = document.getElementById("theme-btn");
    let currenttheme = localStorage.getItem("theme") || "dark";

    document.documentElement.setAttribute("data-theme", currenttheme);
    themebtn.setAttribute('data-raw-content', currenttheme === "dark" ? "switch to light mode" : "switch to dark mode");

    /* topbar navigation */
    const tablinks = document.querySelectorAll("#topbar a");

    function activatetab(tabid) {
        const targetsection = document.getElementById("tab-" + tabid);
        if (!targetsection) return;

        document.querySelectorAll('.tab-section').forEach(sec => {
            sec.classList.remove('active-tab');
        });
        tablinks.forEach(link => link.classList.remove('active'));

        targetsection.classList.add('active-tab');
        const activelink = Array.from(tablinks).find(link => link.getAttribute("href") === `#${tabid}`);
        if (activelink) activelink.classList.add('active');

        nabh.renderwidgets();
    }

    tablinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetid = link.getAttribute("href").replace("#", "");
            activatetab(targetid);
            history.pushState(null, null, `#${targetid}`);
        });
    });

    const initialhash = location.hash.replace("#", "") || "home";
    activatetab(initialhash);

    window.addEventListener("popstate", () => {
        const hash = location.hash.replace("#", "") || "home";
        activatetab(hash);
    });

    nabh.init();

    /* matrix background logic */
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    const pixelscale = 2.5;
    let width = canvas.width = Math.floor(window.innerWidth / pixelscale);
    let height = canvas.height = Math.floor(window.innerHeight / pixelscale);

    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split('');
    const fontsize = 10;
    let columns = Math.floor(width / fontsize);
    let drops = [];

    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    function hextorgba(hex, alpha) {
        if (!hex) return `rgba(0,0,0,${alpha})`;
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    let matrixcolor = getComputedStyle(document.documentElement).getPropertyValue('--matrix-text').trim();
    let matrixbg = getComputedStyle(document.documentElement).getPropertyValue('--matrix-bg').trim();
    let fadebg = hextorgba(matrixbg, 0.12);

    let matrixTimer = null;
    let matrixActive = false;

    function drawmatrix() {
        ctx.fillStyle = fadebg;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = matrixcolor;
        ctx.font = fontsize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontsize, drops[i] * fontsize);

            if (drops[i] * fontsize > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    const asciiLogo = document.querySelector('.ascii-logo');
    if (asciiLogo) {
        asciiLogo.addEventListener('click', (e) => {
            if (e.detail === 3) {
                matrixActive = !matrixActive;
                if (matrixActive) {
                    matrixTimer = setInterval(drawmatrix, 60);
                } else {
                    clearInterval(matrixTimer);
                    matrixTimer = null;
                    ctx.clearRect(0, 0, width, height);
                }
            }
        });
    }

    window.addEventListener('resize', () => {
        width = canvas.width = Math.floor(window.innerWidth / pixelscale);
        height = canvas.height = Math.floor(window.innerHeight / pixelscale);
        columns = Math.floor(width / fontsize);
        drops = [];
        for (let x = 0; x < columns; x++) drops[x] = 1;

        if (!matrixActive) {
            ctx.clearRect(0, 0, width, height);
        }
    });

    themebtn.addEventListener("click", () => {
        let theme = document.documentElement.getAttribute("data-theme");
        let newtheme = theme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newtheme);
        currenttheme = newtheme;
        localStorage.setItem("theme", newtheme);

        themebtn.setAttribute('data-raw-content', newtheme === "dark" ? "switch to light mode" : "switch to dark mode");
        nabh.renderwidgets();

        setTimeout(() => {
            matrixcolor = getComputedStyle(document.documentElement).getPropertyValue('--matrix-text').trim();
            matrixbg = getComputedStyle(document.documentElement).getPropertyValue('--matrix-bg').trim();
            fadebg = hextorgba(matrixbg, 0.12);
        }, 50);
    });
});
