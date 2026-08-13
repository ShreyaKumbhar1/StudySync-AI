const starsContainer = document.getElementById("stars");

if (starsContainer) {

    for (let i = 0; i < 180; i++) {

        const star = document.createElement("div");

        star.classList.add("star");

        const size = Math.random() * 3 + 1;

        star.style.width = size + "px";
        star.style.height = size + "px";

        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 100 + "%";

        star.style.opacity = Math.random();

        star.style.animationDuration =
            (Math.random() * 3 + 2) + "s";

        star.style.animationDelay =
            Math.random() * 5 + "s";

        starsContainer.appendChild(star);

    }

}
// ----------------------
// Shooting Stars
// ----------------------

function shootingStar(){

    const star = document.createElement("div");

    star.className = "shooting-star";

    star.style.left = Math.random()*50 + "%";

    star.style.top = Math.random()*30 + "%";

    starsContainer.appendChild(star);

    setTimeout(()=>{

        star.remove();

    },2000);

}

setInterval(shootingStar,3000);