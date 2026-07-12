document.addEventListener("DOMContentLoaded", function () {
  const targets = document.querySelectorAll(".section-title2");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, {
    threshold: 0.3
  });

  targets.forEach(el => observer.observe(el));
});

const buttons = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".tab-panel");

buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    buttons.forEach(btn => btn.classList.remove("active"));
    panels.forEach(panel => panel.classList.remove("active"));

    button.classList.add("active");
    panels[index].classList.add("active");
  });
});


