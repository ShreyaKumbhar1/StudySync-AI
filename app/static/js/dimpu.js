const dimpu = document.getElementById("dimpu-character");

// ----------------------------
// Blink
// ----------------------------

function blink() {

    dimpu.style.transition = "transform 0.1s";

    dimpu.style.transform = "scaleY(0.96)";

    setTimeout(() => {

        dimpu.style.transform = "";

    }, 120);

}

setInterval(blink, 4000);

// ----------------------------
// Click Bounce
// ----------------------------

dimpu.addEventListener("click", () => {

    dimpu.style.transition = "transform 0.2s";

    dimpu.style.transform = "scale(1.08)";

    setTimeout(() => {

        dimpu.style.transform = "";

    }, 200);

});
// ------------------------------------
// Automatic Dialogue Rotation
// ------------------------------------

const quotes = [

    "📚 Ready for today's grind?",

    "💜 One task at a time.",

    "🔥 ORION never gives up.",

    "🚀 Academic weapon detected.",

    "🐍 Finish one task. Then another.",

    "✨ Progress > Perfection.",

    "😤 Instagram later. Grades now.",

    "🌙 Keep going, future topper."

];

const bubble = document.getElementById("dimpu-bubble");
console.log(bubble);
let quoteIndex = 0;

setInterval(() => {

    quoteIndex++;

    if (quoteIndex >= quotes.length){

        quoteIndex = 0;

    }

    bubble.style.opacity = "0";

    setTimeout(()=>{

        bubble.textContent = quotes[quoteIndex];

        bubble.style.opacity = "1";

    },300);

},2000);