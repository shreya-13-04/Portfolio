// -----------------------------
// Site core (nav, active link, footer, contact demo)
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => navLinks.classList.remove("open")));
  }

  // sections for active nav link detection (only real sections with ids)
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const navItems = Array.from(document.querySelectorAll(".nav-link"));

  window.addEventListener("scroll", () => {
    let current = "";
    const top = window.scrollY + 140; // offset
    for (const section of sections) {
      const offset = section.offsetTop;
      const height = section.offsetHeight;
      if (top >= offset && top < offset + height) current = section.id;
    }
    navItems.forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
    });
  }, { passive: true });

  // Dynamic year
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Contact demo
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thanks for reaching out! This form is a demo. Connect with me via email/LinkedIn.");
      contactForm.reset();
    });
  }
});

// css/js/main.js

// ... [Your existing DOMContentLoaded code block ends here] ...
// }); 


// -----------------------------
// Typewriter Effect for Name
// -----------------------------

const targetElement = document.getElementById('typewriter-name');
const nameToType = "Shreya";
const typingSpeed = 150; // Milliseconds per character
const pauseTime = 1500;  // Milliseconds to wait before deleting/restarting

let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    // 1. Determine the text to display based on whether we are typing or deleting
    const currentText = isDeleting 
        ? nameToType.substring(0, charIndex - 1) 
        : nameToType.substring(0, charIndex + 1);

    targetElement.textContent = currentText;

    // 2. Decide the next action: typing, pausing, or deleting
    if (!isDeleting && charIndex < nameToType.length) {
        // Typing: Move to the next character
        charIndex++;
        // Use typingSpeed for the delay
        setTimeout(typeWriter, typingSpeed);
    } 
    else if (isDeleting && charIndex > 0) {
        // Deleting: Move to the previous character
        charIndex--;
        // Speed up deleting to look smooth (e.g., half the typing speed)
        setTimeout(typeWriter, typingSpeed / 2); 
    } 
    else if (!isDeleting && charIndex === nameToType.length) {
        // Paused at the end: Start deleting after a longer pause
        isDeleting = true;
        setTimeout(typeWriter, pauseTime);
    } 
    else if (isDeleting && charIndex === 0) {
        // Paused at the start: Start typing again
        isDeleting = false;
        // Optionally, reset the pointer here (not necessary if you use the substring logic above)
        setTimeout(typeWriter, typingSpeed);
    }
}

// Check if the element exists and start the process
if (targetElement) {
    typeWriter();
}
