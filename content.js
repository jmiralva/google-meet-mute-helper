// Google Meet Mute Helper
// 1. Hides the "Microphone muted by system" popup
// 2. Auto-unmutes when Meet tries to mute you (so your push-to-talk app stays in control)

(function() {
  'use strict';

  // ========== POPUP HIDING ==========
  
  // Inject a style tag for more persistent hiding
  function injectHidingStyles() {
    if (document.getElementById('google-meet-mute-helper-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'google-meet-mute-helper-styles';
    style.textContent = `
      .google-meet-mute-helper-hidden {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function hidePopup(element) {
    // Apply both class and inline styles for maximum persistence
    if (element.classList.contains('google-meet-mute-helper-hidden')) return;
    
    element.classList.add('google-meet-mute-helper-hidden');
    element.style.setProperty('display', 'none', 'important');
    element.style.setProperty('visibility', 'hidden', 'important');
    element.setAttribute('aria-hidden', 'true');
    console.log('[Google Meet Mute Helper] Popup hidden');
  }

  function findAndHidePopups() {
    // Strategy 1: Target the specific dialog structure from the DOM sample
    // Look for dialogs with the "Microphone muted by system" text
    document.querySelectorAll('[role="dialog"], [role="alert"], [role="alertdialog"]').forEach(el => {
      if (el.textContent.includes('Microphone muted by system') || 
          el.textContent.includes('muted by system') ||
          el.textContent.includes('Open Sound Settings')) {
        hidePopup(el);
      }
    });

    // Strategy 2: Target by class patterns from the DOM sample
    document.querySelectorAll('.TZFSLb, .P9KVBf, [data-is-persistent="true"]').forEach(el => {
      if (el.textContent.includes('Microphone muted by system') || 
          el.textContent.includes('muted by system')) {
        hidePopup(el);
      }
    });

    // Strategy 3: Text-based fallback using TreeWalker
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      
      if (text.includes('Microphone muted by system') || text.includes('muted by system')) {
        let container = node.parentElement;
        let attempts = 0;
        
        while (container && attempts < 10) {
          const style = window.getComputedStyle(container);
          const isPopupLike = (
            style.position === 'absolute' || 
            style.position === 'fixed' ||
            container.getAttribute('role') === 'dialog' ||
            container.getAttribute('role') === 'alert' ||
            container.getAttribute('role') === 'alertdialog'
          );
          
          if (isPopupLike) {
            hidePopup(container);
            break;
          }
          
          container = container.parentElement;
          attempts++;
        }
      }
    }
  }

  // ========== AUTO-UNMUTE ==========
  
  let isUnmuting = false; // Prevent rapid re-triggers
  
  function findMicButton() {
    // The mic button has jsname="hw0c9" and data-is-muted attribute
    return document.querySelector('button[jsname="hw0c9"][data-is-muted]');
  }
  
  function checkAndUnmute() {
    if (isUnmuting) return;
    
    const micButton = findMicButton();
    if (!micButton) return;
    
    const isMuted = micButton.getAttribute('data-is-muted') === 'true';
    
    if (isMuted) {
      isUnmuting = true;
      console.log('[Google Meet Mute Helper] Meet muted you - auto-unmuting...');
      
      // Small delay to avoid race conditions with Meet's own JS
      setTimeout(() => {
        const btn = findMicButton();
        if (btn && btn.getAttribute('data-is-muted') === 'true') {
          btn.click();
          console.log('[Google Meet Mute Helper] Clicked unmute button');
        }
        
        // Reset flag after a short cooldown
        setTimeout(() => {
          isUnmuting = false;
        }, 500);
      }, 100);
    }
  }
  
  // ========== OBSERVERS ==========
  
  const observer = new MutationObserver((mutations) => {
    let shouldCheckPopups = false;
    let shouldCheckMute = false;
    
    for (const mutation of mutations) {
      // Check for new nodes (popups)
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldCheckPopups = true;
      }
      
      // Check for attribute changes on the mic button
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'data-is-muted' &&
          mutation.target.getAttribute('jsname') === 'hw0c9') {
        shouldCheckMute = true;
      }
    }
    
    if (shouldCheckPopups) {
      requestAnimationFrame(findAndHidePopups);
    }
    
    if (shouldCheckMute) {
      requestAnimationFrame(checkAndUnmute);
    }
  });

  function startObserver() {
    if (document.body) {
      // Inject our CSS class
      injectHidingStyles();
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-is-muted']
      });
      
      // Initial checks
      findAndHidePopups();
      checkAndUnmute();
      
      console.log('[Google Meet Mute Helper] Observer started - popup hiding + auto-unmute active');
    } else {
      requestAnimationFrame(startObserver);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }

})();
