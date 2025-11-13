/**
 * Brown Faculty Club - Main JavaScript
 * Handles page navigation, form functionality, and photo carousel
 */

// Page navigation system
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('[data-page]');

function showPage(pageId) {
  // Hide all pages
  pages.forEach(p => p.classList.remove('active'));
  
  // Show selected page
  const targetPage = document.getElementById('page-' + pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Update nav active state
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Attach click handlers to all navigation links
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const pageId = link.getAttribute('data-page');
    showPage(pageId);
  });
});

// Form logic (preserved from original)
const stepsElems = [...document.querySelectorAll('.step')];
const formSteps = [...document.querySelectorAll('.form-step')];
let cur = 1;

const updateSteps = () => {
  stepsElems.forEach(s => {
    s.classList.toggle('active', Number(s.dataset.step) === cur);
  });
  formSteps.forEach(f => {
    f.style.display = Number(f.dataset.step) === cur ? 'block' : 'none';
  });
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (backBtn) backBtn.style.display = cur === 1 ? 'none' : 'inline-block';
  if (nextBtn) nextBtn.textContent = cur === 4 ? 'Submit' : 'Next →';
};

// Initialize form if it exists
if (stepsElems.length > 0) {
  updateSteps();
}

// Navigation
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');

if (nextBtn) {
  nextBtn.addEventListener('click', async () => {
    if (cur < 4) {
      if (!validateStep(cur)) return;
      cur++;
      if (cur === 4) buildPreview();
      updateSteps();
    } else {
      if (!validateStep(cur)) return;
      alert('This is a demo. Data is shown in the preview area and can be saved as a JSON file.');
    }
  });
}

if (backBtn) {
  backBtn.addEventListener('click', () => {
    if (cur > 1) cur--;
    updateSteps();
  });
}

// Conditional hostEvents
const hostEventsSelect = document.getElementById('hostEvents');
if (hostEventsSelect) {
  hostEventsSelect.addEventListener('change', (e) => {
    const el = document.getElementById('hostDetails');
    if (el) {
      el.style.display = e.target.value === 'yes' ? 'block' : 'none';
    }
  });
}

// Photo preview
const photoInput = document.getElementById('photo');
if (photoInput) {
  photoInput.addEventListener('change', (e) => {
    const p = document.getElementById('photoPreview');
    if (!p) return;
    p.innerHTML = '';
    const file = e.target.files[0];
    if (!file) return;
    const img = document.createElement('img');
    img.className = 'thumb';
    img.alt = 'Profile';
    p.appendChild(img);
    const reader = new FileReader();
    reader.onload = () => img.src = reader.result;
    reader.readAsDataURL(file);
  });
}

// Basic validation per step
function validateStep(step) {
  document.querySelectorAll('.error').forEach(e => e.style.display = 'none');

  if (step === 1) {
    const f = document.getElementById('firstName')?.value.trim() || '';
    const l = document.getElementById('lastName')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    let ok = true;
    if (!f) { showError('firstName','Please enter first name'); ok=false; }
    if (!l) { showError('lastName','Please enter last name'); ok=false; }
    if (!validateEmail(email)) { showError('email','Enter a valid email'); ok=false; }
    return ok;
  }
  return true;
}

function showError(id,msg){
  const el = document.querySelector(`.error[data-for="${id}"]`);
  if (el){ el.textContent = msg; el.style.display = 'block'; }
}

function validateEmail(email){
  return /\S+@\S+\.\S+/.test(email);
}

// Build preview
function collectData() {
  return {
    firstName: document.getElementById('firstName')?.value.trim() || '',
    lastName: document.getElementById('lastName')?.value.trim() || '',
    email: document.getElementById('email')?.value.trim() || '',
    phone: document.getElementById('phone')?.value.trim() || '',
    membershipType: document.getElementById('membershipType')?.value || '',
    department: document.getElementById('department')?.value.trim() || '',
    hostEvents: document.getElementById('hostEvents')?.value || '',
    hostTypes: document.getElementById('hostTypes')?.value.trim() || '',
    emergency: document.getElementById('emergency')?.value.trim() || '',
    newsletter: document.getElementById('newsletter')?.value || '',
    contactMethod: document.getElementById('contactMethod')?.value || '',
    heard: document.getElementById('heard')?.value || '',
    notes: document.getElementById('notes')?.value || '',
    photoName: (document.getElementById('photo')?.files[0] || {}).name || null,
    timestamp: new Date().toISOString()
  };
}

function buildPreview(){
  const data = collectData();
  const preview = document.getElementById('previewBox');
  if (!preview) return;
  
  preview.innerHTML = `
    <strong>${escapeHtml(data.firstName || '[First]')} ${escapeHtml(data.lastName || '[Last]')}</strong>
    <div class="small">${escapeHtml(data.email || '')}${data.phone ? ' · ' + escapeHtml(data.phone) : ''}</div>
    <hr style="margin:10px 0;" />
    <div><strong>Membership:</strong> ${escapeHtml(data.membershipType)} · ${escapeHtml(data.department)}</div>
    <div><strong>Host events:</strong> ${escapeHtml(data.hostEvents)} ${data.hostTypes ? '<div style="margin-top:6px;">' + escapeHtml(data.hostTypes) + '</div>' : ''}</div>
    <div style="margin-top:8px;"><strong>Newsletter:</strong> ${escapeHtml(data.newsletter)} · Preferred: ${escapeHtml(data.contactMethod)}</div>
    <div style="margin-top:8px;"><strong>Notes:</strong> ${escapeHtml(data.notes || '—')}</div>
    ${data.photoName ? `<div style="margin-top:8px;"><strong>Uploaded photo:</strong> ${escapeHtml(data.photoName)}</div>` : ''}
  `;
  
  const jsonOut = document.getElementById('jsonOut');
  if (jsonOut) {
    jsonOut.textContent = JSON.stringify(data, null, 2);
  }
}

// Save JSON button
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    const data = collectData();
    const filename = `faculty-club-demo-${(new Date()).toISOString().slice(0,19)}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });
}

// Utility
function escapeHtml(s){ 
  if (!s) return ''; 
  return s.replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); 
}

// Expose steps clickable
stepsElems.forEach(s => s.addEventListener('click', () => {
  const n = Number(s.dataset.step);
  cur = n;
  if (cur === 4) buildPreview();
  updateSteps();
}));

// Load default test values for nicer demo
(function seedDemo(){
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const department = document.getElementById('department');
  
  if (firstName) firstName.value = 'Alex';
  if (lastName) lastName.value = 'Morgan';
  if (email) email.value = 'alex.morgan@example.edu';
  if (department) department.value = 'English';
})();

// Photo Carousel Functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

const captions = [
  'Our welcoming interior spaces create the perfect atmosphere for dining and conversation',
  'The main dining room features elegant décor and comfortable seating for all occasions',
  'Flexible event spaces accommodate everything from intimate meetings to large receptions',
  'Barbara\'s Bar provides a cozy setting for drinks and casual gatherings',
  'The historic façade welcomes members and guests to our distinguished club',
  'Private meeting rooms offer professional settings for departmental gatherings',
  'Fine dining experiences showcase our commitment to exceptional cuisine',
  'Our event spaces transform to match the vision for your special occasion'
];

function createDots() {
  const dotsContainer = document.getElementById('carouselDots');
  if (!dotsContainer) return;
  
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.onclick = () => goToSlide(i);
    dotsContainer.appendChild(dot);
  }
}

function updateSlide() {
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });
  
  const dots = document.querySelectorAll('.carousel-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
  
  const caption = document.getElementById('carouselCaption');
  if (caption && captions[currentSlide]) {
    caption.textContent = captions[currentSlide];
  }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateSlide();
}

function previousSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateSlide();
}

function goToSlide(index) {
  currentSlide = index;
  updateSlide();
}

// Auto-advance carousel every 5 seconds
let autoSlideTimer;

// Pause auto-advance when user interacts
function pauseAutoSlide() {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer);
  }
  autoSlideTimer = setInterval(nextSlide, 5000); // Restart timer
}

// Initialize carousel if it exists
if (document.getElementById('photoCarousel') && totalSlides > 0) {
  createDots();
  updateSlide();
  
  // Start auto-advance
  autoSlideTimer = setInterval(nextSlide, 5000);
  
  // Add event listeners to pause auto-advance on interaction
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  
  if (prevBtn) prevBtn.addEventListener('click', pauseAutoSlide);
  if (nextBtn) nextBtn.addEventListener('click', pauseAutoSlide);
  
  // Add event listeners to dots (will be added after createDots)
  setTimeout(() => {
    document.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', pauseAutoSlide);
    });
  }, 100);
}

// Facility modal functionality
const facilityData = {
  huttner: {
    title: 'Huttner Room',
    image: 'file:///C:/Users/jgphelan/OneDrive%20-%20Brown%20University/Faculty%20Club%20Photo%20Dump/IMG_0243.jpg',
    description: `
      <p>The Huttner Room is our premier private dining space, offering an elegant atmosphere perfect for formal gatherings, special celebrations, and distinguished events. Named after a prominent Brown University benefactor, this beautifully appointed room combines classic charm with modern amenities.</p>
      <p>Features include rich wood paneling, elegant furnishings, and ambient lighting that creates an intimate yet sophisticated dining experience. The room's flexible layout can accommodate various seating arrangements to suit your event needs.</p>
      <p>Perfect for faculty dinners, department celebrations, wedding receptions, and other special occasions that require a refined setting.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Capacity:</strong> Up to 40 guests</li>
        <li><strong>Layout:</strong> Formal dining</li>
        <li><strong>Features:</strong> Private entrance</li>
        <li><strong>A/V:</strong> Available upon request</li>
        <li><strong>Catering:</strong> Full-service available</li>
        <li><strong>Ambiance:</strong> Elegant & intimate</li>
      </ul>
    `
  },
  landscape: {
    title: 'Landscape Room',
    image: 'file:///C:/Users/jgphelan/OneDrive%20-%20Brown%20University/Faculty%20Club%20Photo%20Dump/IMG_0239.jpg',
    description: `
      <p>The Landscape Room offers a versatile meeting space with abundant natural light and flexible seating arrangements. This modern, comfortable room is ideal for presentations, workshops, departmental meetings, and professional gatherings.</p>
      <p>Large windows provide inspiring views of the campus landscape, while the neutral color palette and contemporary furnishings create a professional yet welcoming environment. The room's adaptable layout ensures it can meet various meeting formats and group sizes.</p>
      <p>Equipped with modern amenities and technology support, the Landscape Room is perfect for academic conferences, board meetings, and collaborative work sessions.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Capacity:</strong> Up to 25 guests</li>
        <li><strong>Layout:</strong> Flexible seating</li>
        <li><strong>Features:</strong> Natural light</li>
        <li><strong>A/V:</strong> Built-in presentation system</li>
        <li><strong>Catering:</strong> Coffee service available</li>
        <li><strong>Ambiance:</strong> Professional & bright</li>
      </ul>
    `
  },
  piscerne: {
    title: 'Piscerne Room',
    image: 'file:///C:/Users/jgphelan/OneDrive%20-%20Brown%20University/Faculty%20Club%20Photo%20Dump/IMG_0088%20(1).jpg',
    description: `
      <p>The intimate Piscerne Room provides the perfect setting for small meetings, private conversations, and exclusive gatherings. This cozy space offers privacy and comfort, making it ideal for confidential discussions, small group consultations, and intimate dining experiences.</p>
      <p>The room's warm atmosphere and thoughtful design create an environment conducive to meaningful conversations and focused collaboration. Rich fabrics, comfortable seating, and tasteful décor contribute to its welcoming ambiance.</p>
      <p>Frequently chosen for executive meetings, private interviews, small celebration dinners, and other occasions requiring discretion and intimacy.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Capacity:</strong> Up to 12 guests</li>
        <li><strong>Layout:</strong> Intimate seating</li>
        <li><strong>Features:</strong> Private & quiet</li>
        <li><strong>A/V:</strong> Basic setup available</li>
        <li><strong>Catering:</strong> Light refreshments</li>
        <li><strong>Ambiance:</strong> Cozy & confidential</li>
      </ul>
    `
  },
  'barbaras-bar': {
    title: "Barbara's Bar",
    image: 'file:///C:/Users/jgphelan/OneDrive%20-%20Brown%20University/Faculty%20Club%20Photo%20Dump/IMG_0096.jpg',
    description: `
      <p>Barbara's Bar provides a relaxed, social atmosphere perfect for casual dining, cocktail receptions, and informal gatherings. This welcoming space combines the comfort of a neighborhood pub with the sophistication expected of a university club.</p>
      <p>The bar features a full selection of wines, craft beers, and classic cocktails, along with a menu of casual fare and light bites. Comfortable seating areas and a warm, inviting atmosphere make it ideal for after-work socializing and casual meetings.</p>
      <p>Popular for faculty happy hours, casual networking events, alumni gatherings, and any occasion where conversation and conviviality are the primary goals.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Capacity:</strong> Up to 30 guests</li>
        <li><strong>Layout:</strong> Bar & lounge seating</li>
        <li><strong>Features:</strong> Full bar service</li>
        <li><strong>A/V:</strong> Background music system</li>
        <li><strong>Catering:</strong> Bar menu available</li>
        <li><strong>Ambiance:</strong> Casual & social</li>
      </ul>
    `
  }
};

function openFacilityModal(facilityId) {
  const modal = document.getElementById('facilityModal');
  const data = facilityData[facilityId];
  
  if (!modal || !data) return;
  
  // Update modal content
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalImage').src = data.image;
  document.getElementById('modalImage').alt = data.title;
  document.getElementById('modalDescription').innerHTML = data.description;
  document.getElementById('modalSpecs').innerHTML = data.specs;
  
  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
  
  // Focus management for accessibility
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeFacilityModal() {
  const modal = document.getElementById('facilityModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Initialize facility cards when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add click handlers to facility cards
  document.querySelectorAll('.facility-card').forEach(card => {
    card.addEventListener('click', function() {
      const facilityId = this.getAttribute('data-facility');
      if (facilityId) {
        openFacilityModal(facilityId);
      }
    });
  });

  // Add modal close handlers
  const modal = document.getElementById('facilityModal');
  if (modal) {
    // Close on overlay click
    modal.querySelector('.modal-overlay')?.addEventListener('click', closeFacilityModal);
    
    // Close on close button click
    modal.querySelector('.modal-close')?.addEventListener('click', closeFacilityModal);
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeFacilityModal();
      }
    });
  }
});

// Make functions globally available for inline onclick handlers
window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.showPage = showPage;
window.openFacilityModal = openFacilityModal;
window.closeFacilityModal = closeFacilityModal;