const zodiacButtons = document.querySelectorAll(".zodiac");
const collectionName = document.querySelector("#collectionName");
const collectionPill = document.querySelector("#collectionPill");
const collectionSymbol = document.querySelector("#collectionSymbol");
const collectionTone = document.querySelector("#collectionTone");
const comingSoonSection = document.querySelector("#coming-soon");
const comingSoonName = document.querySelector("#comingSoonName");
const comingSoonSymbol = document.querySelector("#comingSoonSymbol");
const comingSoonTone = document.querySelector("#comingSoonTone");
const toast = document.querySelector(".toast");
let toastTimer;

const fitReplicaToViewport = () => {
  const scale = window.innerWidth <= 760 ? 1 : Math.min(1, window.innerWidth / 1536);
  document.documentElement.style.setProperty("--page-scale", scale.toString());
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
};

const showComingSoon = (button) => {
  comingSoonName.textContent = button.dataset.name;
  comingSoonSymbol.textContent = button.dataset.symbol;
  comingSoonTone.textContent = button.dataset.tone;
  comingSoonSection.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`${button.dataset.name} Collection is coming soon.`);
};

fitReplicaToViewport();
window.addEventListener("resize", fitReplicaToViewport);

zodiacButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.available !== "true") {
      showComingSoon(button);
      return;
    }

    zodiacButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    collectionName.textContent = button.dataset.name;
    collectionPill.textContent = button.dataset.name;
    collectionSymbol.textContent = button.dataset.symbol;
    collectionTone.textContent = button.dataset.tone;
  });
});
