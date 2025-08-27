document.addEventListener("DOMContentLoaded", function () {
  // Notify button functionality
  const button = document.getElementById("notifyBtn");

  button.addEventListener("click", function () {
    const email = prompt("Enter your email:");

    if (email && email.includes("@")) {
      // Show success message
      alert("Thanks! We'll notify you at " + email);

      // Change button appearance
      const originalText = this.textContent;
      this.textContent = "✓ Added to Waitlist";
      this.style.background = "linear-gradient(135deg, #10b981, #059669)";

      // Reset after 2 seconds
      setTimeout(() => {
        this.textContent = originalText;
        this.style.background = "";
      }, 2000);
    } else if (email) {
      alert("Please enter a valid email");
    }
  });

  // Canvas animation code starts here
  const canvas = document.getElementById("sparksCanvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Spark particle class
  class Spark {
    constructor() {
      this.reset();
      // Random starting position
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 10;
      this.vx = (Math.random() - 0.5) * 3; // Increased horizontal spread
      this.vy = -Math.random() * 4 - 2; // Faster upward movement
      this.life = 1;
      this.decay = Math.random() * 0.008 + 0.003; // Slower decay for longer life
      this.size = Math.random() * 4 + 2; // Larger sparks

      // More fiery colors - oranges, reds, yellows
      const colors = [
        "255, 69, 0", // Red-orange (very fiery)
        "255, 140, 0", // Dark orange
        "255, 200, 0", // Gold
        "255, 100, 0", // Orange
        "255, 50, 0", // Deep red-orange
        "255, 255, 100", // Bright yellow
        "255, 0, 0", // Pure red
        "255, 165, 0", // Orange
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];

      // Add flickering effect
      this.flicker = Math.random() * 0.5 + 0.5;

      // More turbulent movement
      this.drift = (Math.random() - 0.5) * 1; // Increased drift
      this.turbulence = Math.random() * 0.5; // Add turbulence factor
    }

    update() {
      // Physics with more fire-like movement
      this.x +=
        this.vx + this.drift + Math.sin(Date.now() * 0.001) * this.turbulence;
      this.y += this.vy;
      this.vy += 0.03; // Slightly stronger gravity
      this.life -= this.decay;

      // Add flickering
      this.flicker = 0.5 + Math.random() * 0.5;

      // More chaotic horizontal movement
      this.vx += (Math.random() - 0.5) * 0.3;

      // Wind effect
      this.drift += (Math.random() - 0.5) * 0.1;

      // Reset if dead or off screen
      if (this.life <= 0 || this.y < -10) {
        this.reset();
      }
    }

    draw() {
      ctx.save();

      // Enhanced glowing effect for fire
      ctx.shadowBlur = 20 * this.flicker;
      ctx.shadowColor = `rgba(${this.color}, ${this.life * this.flicker})`;

      // Draw main spark with flickering
      ctx.globalAlpha = this.life * this.flicker;

      // Create gradient for more realistic fire
      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.size
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${this.life})`); // White hot center
      gradient.addColorStop(0.3, `rgba(${this.color}, ${this.life})`);
      gradient.addColorStop(1, `rgba(${this.color}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.flicker, 0, Math.PI * 2);
      ctx.fill();

      // Add ember trail effect
      ctx.globalAlpha = this.life * 0.3;
      ctx.fillStyle = `rgba(255, 50, 0, ${this.life * 0.5})`;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(
          this.x - this.vx * i * 1.5,
          this.y - this.vy * i * 1.5,
          this.size * (1 - i * 0.2),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Create sparks array
  const sparks = [];
  const sparkCount = 150; // More sparks for denser effect

  for (let i = 0; i < sparkCount; i++) {
    sparks.push(new Spark());
  }

  // Animation loop
  function animate() {
    // Darker trail for more contrast with bright sparks
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)"; // Darker, more opaque
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw sparks
    sparks.forEach((spark) => {
      spark.update();
      spark.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();

  // Add mouse interaction - create fire burst on mouse move
  canvas.addEventListener("mousemove", (e) => {
    // Create more sparks on mouse movement for fire effect
    for (let i = 0; i < 4; i++) {
      // Multiple sparks per mouse move
      if (Math.random() > 0.3) {
        // Higher chance of spark creation
        const spark = new Spark();
        spark.x = e.clientX + (Math.random() - 0.5) * 10;
        spark.y = e.clientY + (Math.random() - 0.5) * 10;
        spark.vy = -Math.random() * 6 - 3; // Stronger upward burst
        spark.vx = (Math.random() - 0.5) * 8; // More spread
        spark.size = Math.random() * 5 + 3; // Larger mouse sparks
        sparks.push(spark);

        // Remove oldest spark if too many
        if (sparks.length > sparkCount * 2) {
          sparks.shift();
        }
      }
    }
  });
}); // This closes DOMContentLoaded
