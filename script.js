document.addEventListener('DOMContentLoaded', () => {
  const weddingScreen = document.getElementById('wedding-screen');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const btnOpenInvitation = document.getElementById('btn-open-invitation');
  const guestNameElement = document.getElementById('guest-name');
  const arrumScreen = document.getElementById('arrum-screen');
  const coupleScreen = document.getElementById('couple-screen');
  const scheduleScreen = document.getElementById('schedule-screen');
  const giftScreen = document.getElementById('gift-screen');
  const wishesScreen = document.getElementById('wishes-screen');
  const thankyouScreen = document.getElementById('thankyou-screen');

  // Immediately activate main wedding screen as the cover
  if (weddingScreen) {
    weddingScreen.classList.remove('hidden-screen');
    weddingScreen.classList.add('active', 'active-wedding');
  }

  /* ==========================================================================
     GET GUEST NAME FROM URL PARAMETERS (?to=Nama+Tamu atau ?u=Nama+Tamu)
     ========================================================================== */
  function loadGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to') || urlParams.get('u');
    if (guestName) {
      guestNameElement.innerText = decodeURIComponent(guestName.replace(/\+/g, ' '));
    } else {
      guestNameElement.innerText = "Tamu Undangan";
    }
  }
  loadGuestName();

  /* ==========================================================================
     BUKA UNDANGAN BUTTON CLICK HANDLER
     ========================================================================== */
  btnOpenInvitation.addEventListener('click', () => {
    // 1. Show Music Toggle and Play Background Music
    musicToggle.classList.remove('hidden');
    playMusic();
    
    // 2. Perform a beautiful open confirmation (e.g. animate button, show toast)
    btnOpenInvitation.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btnOpenInvitation.style.transform = '';
      
      // Smoothly scroll down to Ar-Rum section
      arrumScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(handleScroll, 200);
      setTimeout(handleScroll, 500);
    }, 150);

    // Create a beautiful, premium toast notification
    showToast(`Selamat datang, ${guestNameElement.innerText}!`);
  });

  function showToast(message) {
    // Check if toast already exists
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.innerText = message;
    
    // Add active class
    toast.classList.add('show');
    
    // Remove after 3.5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  /* ==========================================================================
     MUSIC CONTROLLER
     ========================================================================== */
  
  function playMusic() {
    bgMusic.play().then(() => {
      musicToggle.classList.remove('muted');
    }).catch((err) => {
      console.log("Autoplay blocked. Awaiting user gesture.", err);
    });
  }

  function toggleMusic() {
    if (bgMusic.paused) {
      bgMusic.play();
      musicToggle.classList.remove('muted');
    } else {
      bgMusic.pause();
      musicToggle.classList.add('muted');
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  /* ==========================================================================
     SCROLL OBSERVER & ANIMATION TRIGGERS (Free Scrolling)
     ========================================================================== */
  const appContainer = document.getElementById('app');

  function activateScreen(screen) {
    if (!screen) return;
    const id = screen.id;
    if (id === 'wedding-screen') screen.classList.add('active-wedding');
    else if (id === 'arrum-screen') screen.classList.add('active-arrum');
    else if (id === 'couple-screen') screen.classList.add('active-couple');
    else if (id === 'schedule-screen') screen.classList.add('active-schedule');
    else if (id === 'gift-screen') screen.classList.add('active-gift');
    else if (id === 'wishes-screen') screen.classList.add('active-wishes');
    else if (id === 'thankyou-screen') screen.classList.add('active-thankyou');
  }

  // Activate wedding screen immediately
  weddingScreen.classList.add('active-wedding');

  // IntersectionObserver to activate sections when scrolled into view
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activateScreen(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12
    });

    document.querySelectorAll('.screen').forEach(screen => {
      observer.observe(screen);
    });
  }

  // Scroll listener for smooth triggering on container scroll
  function handleScroll() {
    const vh = window.innerHeight;
    document.querySelectorAll('.screen').forEach(screen => {
      const rect = screen.getBoundingClientRect();
      if (rect.top < vh * 0.88 && rect.bottom > vh * 0.1) {
        activateScreen(screen);
      }
    });
  }

  if (appContainer) {
    appContainer.addEventListener('scroll', handleScroll, { passive: true });
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  // Initial activation check
  handleScroll();

  // Desktop mousewheel support: if wheel occurs outside #app, forward to #app
  window.addEventListener('wheel', (e) => {
    if (appContainer && !appContainer.contains(e.target)) {
      appContainer.scrollTop += e.deltaY;
    }
  }, { passive: true });

  // --- Clipboard Copy Feature ---
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;

      // Filter out icon element html tags if copying address or physical gifts
      const textToCopy = targetElement.innerText || targetElement.textContent;
      
      navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        // Show temporary success feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
        button.style.background = 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'; // Green feedback
        
        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.style.background = ''; // Restore original
        }, 2000);
      }).catch(err => {
        console.error('Gagal menyalin rekening: ', err);
      });
    });
  });

  // --- Wishes Board / RSVP Logic ---
  const wishesForm = document.getElementById('wishes-form');
  const wishesList = document.getElementById('wishes-list');
  const wishesCountEl = document.getElementById('wishes-count');

  // URL Web App Google Apps Script untuk menghubungkan data ucapan ke Google Sheets.
  // Silakan tempelkan URL Web App Anda di dalam tanda kutip di bawah ini.
  const GOOGLE_SHEETS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzrt_u6_RfjCyTCluyDvXGR1fDgGJxo2HF2DBdd0LX_GnwuirTX0_QnWOVFP8eJj4rx/exec';

  // Pre-load default wishes if not present in local storage
  const defaultWishes = [
    {
      name: "Andi & Keluarga",
      rsvp: "Hadir",
      message: "Selamat menempuh hidup baru Laila & Majnun! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.",
      date: new Date('2026-06-20T10:00:00').toLocaleString()
    },
    {
      name: "Siti Rahma",
      rsvp: "Hadir",
      message: "Selamat ya! Lancar-lancar sampai hari H. Semoga dilimpahi kebahagiaan selalu.",
      date: new Date('2026-06-21T15:30:00').toLocaleString()
    },
    {
      name: "Budi Santoso",
      rsvp: "Tidak Hadir",
      message: "Selamat berbahagia untuk kedua mempelai. Mohon maaf tidak bisa hadir langsung, namun doa kami menyertai.",
      date: new Date('2026-06-22T08:15:00').toLocaleString()
    }
  ];

  function getWishes() {
    const stored = localStorage.getItem('wedding_wishes');
    if (!stored) {
      localStorage.setItem('wedding_wishes', JSON.stringify(defaultWishes));
      return defaultWishes;
    }
    return JSON.parse(stored);
  }

  function saveWishes(wishes) {
    localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
  }

  function renderWishes(wishesData) {
    if (!wishesList || !wishesCountEl) return;
    const wishes = wishesData || getWishes();
    
    // Copy array so we don't mutate original
    const wishesToRender = [...wishes];
    
    // Sort wishes so latest is at the top
    wishesToRender.reverse();

    wishesCountEl.innerText = wishesToRender.length;
    wishesList.innerHTML = '';

    wishesToRender.forEach(wish => {
      const item = document.createElement('div');
      item.className = 'wish-item';
      
      const name = wish.name || 'Anonim';
      const rsvp = wish.rsvp || 'Hadir';
      const message = wish.message || '';
      
      const rsvpClass = rsvp.toLowerCase().replace(' ', '-');
      
      item.innerHTML = `
        <div class="wish-item-header">
          <span class="wish-item-name">${escapeHtml(name)}</span>
          <span class="wish-item-rsvp rsvp-${rsvpClass}">${escapeHtml(rsvp)}</span>
        </div>
        <p class="wish-item-message">${escapeHtml(message)}</p>
      `;
      wishesList.appendChild(item);
    });
  }

  function loadWishesFromSheet() {
    if (!GOOGLE_SHEETS_SCRIPT_URL) return;
    
    fetch(GOOGLE_SHEETS_SCRIPT_URL)
      .then(response => response.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          // Simpan ke local storage sebagai cache
          localStorage.setItem('wedding_wishes', JSON.stringify(data));
          // Render data terbaru dari Google Sheets
          renderWishes(data);
        }
      })
      .catch(err => {
        console.error("Gagal mengambil ucapan dari Google Sheets:", err);
      });
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  if (wishesForm) {
    wishesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('wish-name');
      const rsvpSelect = document.getElementById('wish-rsvp');
      const messageInput = document.getElementById('wish-message');
      
      const name = nameInput.value.trim();
      const rsvp = rsvpSelect.value;
      const message = messageInput.value.trim();
      
      if (!name || !rsvp || !message) return;
      
      const wishes = getWishes();
      wishes.push({
        name: name,
        rsvp: rsvp,
        message: message,
        date: new Date().toLocaleString()
      });
      
      saveWishes(wishes);
      renderWishes();
      
      // Kirim data secara asinkron ke Google Sheets jika URL terkonfigurasi
      if (GOOGLE_SHEETS_SCRIPT_URL) {
        const formData = new URLSearchParams();
        formData.append('date', new Date().toLocaleString('id-ID'));
        formData.append('name', name);
        formData.append('rsvp', rsvp);
        formData.append('message', message);

        fetch(GOOGLE_SHEETS_SCRIPT_URL, {
          method: 'POST',
          body: formData,
          mode: 'no-cors'
        })
        .then(() => {
          console.log('Data ucapan berhasil dikirim ke Google Sheets!');
          // Ambil kembali data segar dari Google Sheets setelah jeda 1.5 detik
          setTimeout(loadWishesFromSheet, 1500);
        })
        .catch(err => console.error('Gagal mengirim ke Google Sheets:', err));
      }
      
      // Clear inputs
      nameInput.value = '';
      rsvpSelect.value = '';
      messageInput.value = '';
      
      // Scroll wishes list to top to show new wish
      if (wishesList) {
        wishesList.scrollTop = 0;
      }
    });
  }

  // Load and render initially
  try {
    renderWishes();
    loadWishesFromSheet();
  } catch (err) {
    console.error("Gagal merender papan ucapan:", err);
  }

  /* ==========================================================================
     COUNTDOWN TIMER LOGIC (Targets Resepsi: Sabtu, 05 Desember 2026 19:30:00 WITA / UTC+8)
     ========================================================================== */
  const targetDate = new Date('2026-12-05T19:30:00+08:00').getTime();
  
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      if (daysEl) daysEl.innerText = "00";
      if (hoursEl) hoursEl.innerText = "00";
      if (minutesEl) minutesEl.innerText = "00";
      if (secondsEl) secondsEl.innerText = "00";
      return;
    }

    const d = Math.floor(difference / (1000 * 60 * 60 * 24));
    const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((difference % (1000 * 60)) / 1000);

    if (daysEl) daysEl.innerText = d.toString().padStart(2, '0');
    if (hoursEl) hoursEl.innerText = h.toString().padStart(2, '0');
    if (minutesEl) minutesEl.innerText = m.toString().padStart(2, '0');
    if (secondsEl) secondsEl.innerText = s.toString().padStart(2, '0');
  }

  try {
    updateCountdown(); // Run once initially
    setInterval(updateCountdown, 1000);
  } catch (err) {
    console.error("Gagal memulai hitung mundur:", err);
  }
});
