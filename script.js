// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // Set current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Intersection Observer for fade-in animations on sections and content cards
    const elementsToFadeIn = document.querySelectorAll('section, .content-card');
    const observerOptions = {
        root: null, // observes intersections relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the element is visible
    };

    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add 'is-visible' class to trigger fade-in animation
                entry.target.classList.add('is-visible');
                
                // If the target is a section, also make its direct text/container divs visible
                // This ensures content directly within sections (not in cards) also fades in.
                if (entry.target.tagName === 'SECTION') {
                    entry.target.querySelectorAll(':scope > div:not(.content-card)').forEach(childDiv => {
                        // We need a small delay or a way to ensure these don't also have 'fade-in-section'
                        // to avoid double animation if they were also targeted by a selector.
                        // For simplicity, we assume they should just become visible with the section.
                        // If they have their own 'fade-in-section' class, the observer will handle them.
                        if (!childDiv.classList.contains('fade-in-section') && !childDiv.classList.contains('content-card')) {
                             childDiv.classList.add('is-visible'); // Or apply a simpler visibility style
                        }
                    });
                }
                // Optional: stop observing the element after it has become visible
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    elementsToFadeIn.forEach(el => {
        // Add the 'fade-in-section' class to elements that should have this animation,
        // if they don't already. This script assumes 'fade-in-section' is on the target elements.
        if(!el.classList.contains('fade-in-section') && (el.tagName === 'SECTION' || el.classList.contains('content-card'))){
             // For sections, the fade-in is applied to the section itself.
             // For cards, the class is expected to be on the card.
             // This logic ensures if the class was missed but it's a target type, it gets the animation trigger.
             // However, for best control, 'fade-in-section' should be on elements in HTML meant to fade.
        }
        fadeInObserver.observe(el);
    });
    

    // Smooth scroll and section highlight for navigation links
    document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Remove highlight from any previously highlighted section
                document.querySelectorAll('.section-highlight').forEach(highlightedSec => {
                    highlightedSec.classList.remove('section-highlight');
                });

                // Scroll to the target element
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start' // Aligns the top of the target element to the top of the viewport
                });

                // Add highlight class after a short delay to allow scroll to start/complete
                // and ensure the class is added after any potential removal from rapid clicks.
                setTimeout(() => {
                    targetElement.classList.add('section-highlight');
                    // Remove the highlight after animation duration (1.5s)
                    setTimeout(() => {
                        targetElement.classList.remove('section-highlight');
                    }, 1500); // Duration of the pulse-border animation matches CSS
                }, 300); // Small delay before adding highlight
            }
        });
    });

    // Subtle background pattern movement on scroll
    let lastKnownScrollPosition = 0;
    let tickingBackground = false; // Flag to optimize scroll event handling

    function moveBackgroundPattern(scrollPos) {
      // Adjust these multipliers for speed and direction of background pattern movement
      // Increased for more visibility as per previous request
      const xOffset = scrollPos * 0.045; 
      const yOffset = scrollPos * 0.075; 
      document.body.style.backgroundPosition = `${xOffset}px ${yOffset}px`;
    }

    window.addEventListener('scroll', () => {
      lastKnownScrollPosition = window.scrollY;
      if (!tickingBackground) {
        window.requestAnimationFrame(() => {
          moveBackgroundPattern(lastKnownScrollPosition);
          tickingBackground = false;
        });
        tickingBackground = true;
      }
    }, { passive: true }); // Use passive listener for better scroll performance

    // Hamburger Menu Toggle Functionality
    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburgerButton && mobileMenu) {
        hamburgerButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            // Optional: Toggle ARIA attributes for accessibility
            const isExpanded = hamburgerButton.getAttribute('aria-expanded') === 'true' || false;
            hamburgerButton.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.setAttribute('aria-hidden', isExpanded); // If menu was open (expanded is true), it's now hidden (so isExpanded is true for aria-hidden)
        });

        // Close mobile menu when a link inside it is clicked
        const mobileMenuLinks = mobileMenu.querySelectorAll('a[href^="#"]');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => { // Added 'e' parameter
                // Hide the menu
                mobileMenu.classList.add('hidden');
                // Reset hamburger ARIA attribute
                hamburgerButton.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');

                // Replicate smooth scroll behavior for mobile links
                // This is similar to the existing smooth scroll for nav-links
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault(); // Prevent default anchor jump only if target exists for scrolling

                    // Remove highlight from any previously highlighted section
                    document.querySelectorAll('.section-highlight').forEach(highlightedSec => {
                        highlightedSec.classList.remove('section-highlight');
                    });

                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Add highlight class after a short delay
                    setTimeout(() => {
                        targetElement.classList.add('section-highlight');
                        setTimeout(() => {
                            targetElement.classList.remove('section-highlight');
                        }, 1500); // Duration of the pulse-border animation
                    }, 300); // Small delay
                }
                // If targetElement is not found, the default anchor behavior will try to navigate.
            });
        });
    }
});
