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
    
    // Special handling for application links - redirect to Google Form
    if (pageId === 'application') {
      window.open('https://docs.google.com/forms/d/e/1FAIpQLSfXY9Ys2BcHLHmOxMFrxPs5_0mmExUje3q6TOE_-e0bSc44rQ/viewform', '_blank');
      return;
    }
    
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
    image: 'C:/Users/jgphelan/Downloads/Faculty Club Photo Dum/Faculty Club Photo Dump/Huttner 1.jpg', // Using inline placeholder instead
    description: `
      <p>The Huttner Room is the Faculty Club's flagship private dining space, offering an atmosphere of distinguished elegance perfect for the most important occasions. This beautifully appointed room showcases the finest in traditional university club design, featuring rich mahogany paneling, crystal chandeliers, and meticulously maintained period furnishings that reflect Brown's storied academic heritage.</p>
      <p>Named in honor of generous University benefactors, the room embodies the timeless sophistication expected of an Ivy League institution. The space features professional table service, elegant china and glassware, and acoustics carefully designed for both intimate conversation and formal presentations.</p>
      <p>Weather permitting, events in the Huttner Room include exclusive access to the adjoining Cornell Courtyard, a charming outdoor space perfect for cocktail hours, reception mingling, or al fresco dining extensions. This unique feature makes the Huttner Room ideal for spring and summer celebrations, graduation dinners, milestone anniversaries, wedding receptions, and distinguished faculty honors ceremonies.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Dimensions:</strong> 32' x 43'</li>
        <li><strong>Seated Capacity:</strong> 96 guests</li>
        <li><strong>Reception Capacity:</strong> 130 guests</li>
        <li><strong>Minimum F&B:</strong> $1,500</li>
        <li><strong>Features:</strong> Cornell Courtyard access, mahogany paneling</li>
        <li><strong>A/V Equipment:</strong> Professional presentation system available</li>
        <li><strong>Best for:</strong> Formal dinners, wedding receptions, major celebrations</li>
      </ul>
    `
  },
  landscape: {
    title: 'Landscape Room',
    image: 'C:/Users/jgphelan/Downloads/Faculty Club Photo Dum/Faculty Club Photo Dump/Landscape 1.jpg',
    description: `
      <p>The Landscape Room represents the perfect fusion of traditional university club elegance with contemporary functionality. This versatile space features floor-to-ceiling windows that flood the room with natural light while providing inspiring views of Brown's historic campus landscape, creating an atmosphere that stimulates both creativity and productivity.</p>
      <p>The room's sophisticated neutral color palette, featuring warm grays and browns complemented by rich wood accents, creates a professional yet welcoming environment. Comfortable upholstered seating can be arranged in multiple configurations - from boardroom-style meetings to classroom presentations to workshop circles - making this space exceptionally adaptable to your specific needs.</p>
      <p>Modern amenities include integrated audio-visual technology, wireless presentation capabilities, and climate control, while maintaining the refined atmosphere expected of a prestigious university club. The Landscape Room is particularly popular for academic conferences, department retreats, board meetings, professional development workshops, and collaborative planning sessions.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Dimensions:</strong> 17' x 44'</li>
        <li><strong>Seated Capacity:</strong> 51 guests</li>
        <li><strong>Reception Capacity:</strong> 70 guests</li>
        <li><strong>Minimum F&B:</strong> $650</li>
        <li><strong>Features:</strong> Floor-to-ceiling windows, campus views</li>
        <li><strong>A/V Equipment:</strong> Integrated presentation system with wireless capability</li>
        <li><strong>Best for:</strong> Academic conferences, professional meetings, workshops</li>
      </ul>
    `
  },
  picerne: {
    title: 'Picerne Room',
    image: null,
    description: `
      <p>The Picerne Room offers an intimate sanctuary within the Faculty Club, perfect for confidential discussions, exclusive small group meetings, and private dining experiences that require discretion and exclusivity. This carefully appointed space combines the privacy of a personal study with the refined amenities of a prestigious university club.</p>
      <p>The room features rich fabric wall coverings, comfortable upholstered seating, and warm lighting that creates an atmosphere conducive to meaningful conversation and focused collaboration. Thoughtful design details include sound-dampening materials for enhanced privacy, elegant wood furnishings, and carefully selected artwork that reflects academic excellence.</p>
      <p>Due to its intimate scale and high demand among faculty and administrators, the Picerne Room has limited availability and is frequently chosen for executive committee meetings, confidential interviews, tenure discussions, small celebration dinners, and occasions requiring complete privacy and uninterrupted focus.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Dimensions:</strong> 16' x 18'</li>
        <li><strong>Seated Capacity:</strong> 24 guests</li>
        <li><strong>Reception Capacity:</strong> 24 guests</li>
        <li><strong>Minimum F&B:</strong> $325</li>
        <li><strong>Availability:</strong> Limited due to high demand</li>
        <li><strong>Features:</strong> Enhanced privacy, sound-dampening</li>
        <li><strong>Best for:</strong> Executive meetings, confidential discussions</li>
      </ul>
    `
  },
  'barbaras-bar': {
    title: "Barbara's Bar",
    image: 'C:/Users/jgphelan/Downloads/Faculty Club Photo Dum/Faculty Club Photo Dump/Bar 1.jpg',
    description: `
      <p>Barbara's Bar embodies the quintessential university club atmosphere - a warm, inviting space where academic colleagues gather for spirited conversation, casual dining, and convivial networking. This thoughtfully designed space strikes the perfect balance between the relaxed comfort of a neighborhood tavern and the sophisticated ambiance expected of a distinguished Ivy League institution.</p>
      <p>The bar features rich wood furnishings, comfortable leather seating areas, and tasteful academic memorabilia that celebrates Brown's illustrious history. Soft lighting creates an intimate atmosphere perfect for both quiet conversations and lively group discussions. The space includes both traditional bar seating and comfortable lounge areas with coffee tables and upholstered chairs.</p>
      <p>Our skilled bartenders offer an extensive selection of craft beers, fine wines, single-malt scotches, and classic cocktails, complemented by a thoughtfully curated menu of elevated pub fare, artisanal appetizers, and light dinner options. Barbara's Bar hosts regular events including faculty wine tastings, book discussions, informal lecture series, and serves as the social heart of the Faculty Club community.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Seated Capacity:</strong> 20 guests</li>
        <li><strong>Reception Capacity:</strong> 35 guests</li>
        <li><strong>Minimum F&B:</strong> $250</li>
        <li><strong>Features:</strong> Full bar service, comfortable lounge seating</li>
        <li><strong>Cuisine:</strong> Elevated pub fare and artisanal appetizers</li>
        <li><strong>Ambiance:</strong> Casual sophistication with academic charm</li>
        <li><strong>Best for:</strong> Faculty mixers, casual dining, networking events</li>
      </ul>
    `
  },
  twaddell: {
    title: 'Twaddell Room',
    image: 'C:/Users/jgphelan/Downloads/Faculty Club Photo Dum/Faculty Club Photo Dump/Twadell 1.jpg',
    description: `
      <p>The Twaddell Room exemplifies intimate elegance within the Faculty Club, providing a private sanctuary perfect for the most sensitive discussions and exclusive small gatherings. Named in honor of a distinguished Brown University family, this compact yet beautifully appointed space maintains the Club's highest standards of sophistication despite its modest dimensions.</p>
      <p>The room's carefully curated décor includes fine artwork, quality furnishings scaled appropriately for the intimate space, and subtle lighting that creates an atmosphere of confidential discretion. Sound-absorbing materials and strategic positioning within the building ensure maximum privacy for sensitive conversations.</p>
      <p>Due to its unique scale and the premium placed on privacy in academic settings, the Twaddell Room has extremely limited availability and is reserved for the most important confidential meetings. It is ideal for tenure committee deliberations, executive search discussions, sensitive negotiations, intimate celebration dinners for close colleagues, and other occasions requiring absolute discretion and exclusivity.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Dimensions:</strong> 12' x 14'</li>
        <li><strong>Capacity:</strong> 12 guests maximum</li>
        <li><strong>Minimum F&B:</strong> $100</li>
        <li><strong>Availability:</strong> Extremely limited, by special request</li>
        <li><strong>Features:</strong> Maximum privacy, sound-dampened</li>
        <li><strong>Best for:</strong> Confidential meetings, executive discussions</li>
      </ul>
    `
  },
  'huttner-twaddell': {
    title: 'Huttner/Twaddell Rooms Combined',
    image: 'C:/Users/jgphelan/Downloads/Faculty Club Photo Dum/Faculty Club Photo Dump/Huttner 5.jpg',
    description: `
      <p>The combined Huttner and Twaddell rooms create the Faculty Club's most magnificent event space, offering unparalleled capacity and grandeur for Brown University's most significant celebrations and gatherings. This extraordinary configuration transforms two distinguished individual spaces into a single, spectacular venue that maintains intimate elegance while accommodating substantial guest lists.</p>
      <p>The combined space seamlessly integrates the mahogany elegance of the Huttner Room with the intimate charm of the Twaddell Room, creating multiple zones for varied activities within a single event. Guests can enjoy cocktail reception areas, formal dining spaces, presentation zones, and circulation areas, all flowing naturally together while maintaining the sophistication expected of an Ivy League institution.</p>
      <p>With exclusive access to the Cornell Courtyard when weather permits, this premier venue expands to include beautiful outdoor spaces, making it ideal for the university's most important occasions: major wedding receptions, significant anniversary celebrations, presidential galas, large alumni gatherings, commencement dinners, and milestone institutional celebrations that require both grandeur and sophistication.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Configuration:</strong> Seamlessly integrated premium spaces</li>
        <li><strong>Seated Capacity:</strong> 108 guests</li>
        <li><strong>Reception Capacity:</strong> 142 guests</li>
        <li><strong>Minimum F&B:</strong> $1,500</li>
        <li><strong>Features:</strong> Cornell Courtyard access, multiple activity zones</li>
        <li><strong>Layout:</strong> Highly flexible with premium appointments</li>
        <li><strong>Best for:</strong> Major celebrations, presidential events, large weddings</li>
      </ul>
    `
  },
  class52: {
    title: "Class of '52 Room",
    image: 'C:/Users/jgphelan/Downloads/Faculty Club Photo Dum/Faculty Club Photo Dump/Class of 52 1.jpg',
    description: `
      <p>The Class of '52 Room stands as a distinguished tribute to the remarkable members of Brown University's Class of 1952, embodying the enduring spirit of academic excellence and alumni dedication that defines the Brown community. This elegantly appointed space serves as both a memorial to past achievements and an inspiration for future generations of scholars.</p>
      <p>The room features classic university club design elements including rich mahogany wainscoting, period furnishings, and carefully curated historical photographs and memorabilia that celebrate Brown's illustrious past. Comfortable seating arrangements can accommodate both formal dinners and casual gatherings, while maintaining an atmosphere of dignified reverence for academic tradition.</p>
      <p>With limited availability due to its historical significance and popularity among alumni groups, the Class of '52 Room is the preferred venue for reunion dinners, milestone anniversary celebrations, legacy society gatherings, emeritus faculty events, and other occasions that honor Brown's distinguished academic heritage and continuing traditions of excellence.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Dimensions:</strong> 16' x 24'</li>
        <li><strong>Seated Capacity:</strong> 30 guests</li>
        <li><strong>Minimum F&B:</strong> $325</li>
        <li><strong>Availability:</strong> Limited for special occasions</li>
        <li><strong>Features:</strong> Historic memorabilia, mahogany wainscoting</li>
        <li><strong>Historical Significance:</strong> Dedicated to Class of 1952</li>
        <li><strong>Best for:</strong> Alumni reunions, legacy events, emeritus celebrations</li>
      </ul>
    `
  },
  wriston: {
    title: 'Wriston Terrace',
    image: 'C:/Users/jgphelan/Downloads/Faculty Club Photo Dum/Faculty Club Photo Dump/Cornell Courtyard 1.jpg',
    description: `
      <p>The Wriston Terrace offers a distinctive al fresco dining and entertainment experience that showcases the natural beauty of Brown's historic campus. Named in honor of former Brown University President Henry Merritt Wriston, this elegant outdoor space provides a refined alternative to traditional indoor venues, perfect for celebrating during New England's beautiful spring, summer, and early fall seasons.</p>
      <p>The terrace features sophisticated outdoor furniture, ambient lighting for evening events, and stunning views of the surrounding campus landscape. Professional-grade weather protection and heating elements extend the usable season, while the space's flexible layout accommodates everything from intimate cocktail receptions to larger celebratory gatherings.</p>
      <p>Weather-dependent availability makes the Wriston Terrace a special venue that requires advance planning and backup indoor arrangements. This unique outdoor setting is particularly popular for graduation celebrations, summer faculty receptions, garden party-style events, outdoor wedding ceremonies, and al fresco dining experiences that take advantage of Providence's most beautiful weather.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Dimensions:</strong> 21' x 53'</li>
        <li><strong>Seated Capacity:</strong> 30 guests</li>
        <li><strong>Reception Capacity:</strong> 50 guests</li>
        <li><strong>Minimum F&B:</strong> $325</li>
        <li><strong>Availability:</strong> Weather permitting (seasonal)</li>
        <li><strong>Features:</strong> Campus views, ambient lighting, professional outdoor furniture</li>
        <li><strong>Best for:</strong> Garden parties, graduation celebrations, outdoor ceremonies</li>
      </ul>
    `
  },
  kapstein: {
    title: 'Kapstein Room',
    image: null,
    description: `
      <p>The Kapstein Room represents the ideal fusion of professional functionality and university club elegance, providing a versatile venue that adapts seamlessly to a wide variety of academic and social gatherings. This thoughtfully designed space strikes the perfect balance between formal sophistication and approachable comfort.</p>
      <p>The room features contemporary furnishings with classic touches, including comfortable seating that can be reconfigured for multiple event styles, warm lighting that enhances both daytime and evening events, and sophisticated décor that complements Brown's academic atmosphere. High-quality audio-visual equipment integrates seamlessly into the space without compromising its elegant ambiance.</p>
      <p>The Kapstein Room's adaptability and reliable availability make it a popular choice for recurring events and spontaneous gatherings alike. It regularly hosts departmental meetings, academic seminars, professional development workshops, small conferences, birthday celebrations, and networking receptions that require a sophisticated yet flexible environment.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Dimensions:</strong> 18' x 16'</li>
        <li><strong>Seated Capacity:</strong> 24 guests</li>
        <li><strong>Reception Capacity:</strong> 28 guests</li>
        <li><strong>Minimum F&B:</strong> $325</li>
        <li><strong>Features:</strong> Highly flexible layout, contemporary comfort</li>
        <li><strong>A/V Equipment:</strong> Integrated presentation system</li>
        <li><strong>Best for:</strong> Department meetings, workshops, professional seminars</li>
      </ul>
    `
  },
  carberry: {
    title: 'Carberry Room',
    image: 'C:/Users/jgphelan/Downloads/Faculty Club Photo Dum/Faculty Club Photo Dump/Carberry 1.jpg',
    description: `
      <p>The Carberry Room represents the ultimate in intimate exclusivity within the Faculty Club - a tiny jewel of a space that provides unparalleled privacy for the most sensitive and important conversations. This remarkably compact room proves that elegance and sophistication are not dependent on size, offering a perfectly appointed environment for discussions requiring absolute confidentiality.</p>
      <p>Despite its modest footprint, every detail has been carefully considered to maximize both comfort and functionality. The room features custom-fitted furnishings, superior acoustic treatment for complete privacy, and lighting designed to create a warm, welcoming atmosphere that puts guests at ease during even the most challenging conversations.</p>
      <p>The Carberry Room is reserved exclusively for the most critical and confidential meetings in academic life: presidential search committees, crisis management discussions, sensitive personnel matters, confidential donor consultations, and intimate celebrations marking truly special personal or professional milestones. Its rarity and exclusivity make it a privilege to use.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Dimensions:</strong> 8' x 10'</li>
        <li><strong>Capacity:</strong> 6 guests maximum</li>
        <li><strong>Minimum F&B:</strong> $100</li>
        <li><strong>Features:</strong> Ultimate privacy, custom furnishings</li>
        <li><strong>Exclusivity:</strong> Reserved for most sensitive discussions</li>
        <li><strong>Best for:</strong> Presidential meetings, crisis management, VIP consultations</li>
      </ul>
    `
  },
  conference: {
    title: 'Conference Room',
    image: 'C:/Users/jgphelan/Downloads/Faculty Club Photo Dum/Faculty Club Photo Dump/Conference 1.jpg',
    description: `
      <p>The Conference Room represents the Faculty Club's commitment to supporting Brown University's academic mission through state-of-the-art meeting facilities designed specifically for professional productivity and collaborative excellence. This purpose-built space combines the sophistication expected of a university club with the functionality required for modern academic and administrative work.</p>
      <p>The room features ergonomic seating, optimal lighting for both presentations and note-taking, advanced audio-visual technology including wireless presentation capabilities, and layout flexibility that supports everything from formal board meetings to interactive workshops. Self-service operation provides convenient access while maintaining cost-effectiveness for regular users.</p>
      <p>As a self-service facility, the Conference Room offers independence and flexibility for frequent users, making it ideal for recurring department meetings, committee sessions, faculty training workshops, administrative planning sessions, and academic conferences that require professional-grade facilities with the convenience of autonomous operation.</p>
    `,
    specs: `
      <ul class="spec-list">
        <li><strong>Dimensions:</strong> 17' x 27'</li>
        <li><strong>Seated Capacity:</strong> 32 guests</li>
        <li><strong>Minimum F&B:</strong> $100</li>
        <li><strong>Service Model:</strong> Self-service operation</li>
        <li><strong>Features:</strong> Advanced A/V technology, ergonomic design</li>
        <li><strong>A/V Equipment:</strong> Wireless presentation system, professional lighting</li>
        <li><strong>Best for:</strong> Department meetings, training sessions, academic conferences</li>
      </ul>
    `
  }
};

function openFacilityModal(facilityId) {
  const modal = document.getElementById('facilityModal');
  const data = facilityData[facilityId];
  
  if (!modal || !data) {
    console.error('Modal or facility data not found:', facilityId);
    return;
  }
  
  // Update modal content
  document.getElementById('modalTitle').textContent = data.title;
  
  // Handle the image area
  const modalImageContainer = modal.querySelector('.modal-image');
  const modalImage = document.getElementById('modalImage');
  
  // Remove any existing placeholder
  const existingPlaceholder = document.getElementById('modalImagePlaceholder');
  if (existingPlaceholder) {
    existingPlaceholder.remove();
  }
  
  if (data.image) {
    // Show actual image if available
    modalImage.src = `file:///${data.image}`;
    modalImage.alt = data.title;
    modalImage.style.display = 'block';
    modalImage.style.cssText = 'width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;';
  } else {
    // Create placeholder if no image
    modalImage.style.display = 'none';
    
    const placeholderDiv = document.createElement('div');
    placeholderDiv.id = 'modalImagePlaceholder';
    placeholderDiv.style.cssText = `
      width: 100%;
      height: 300px;
      background: #2d3748;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
    `;
    placeholderDiv.textContent = data.title;
    modalImageContainer.insertBefore(placeholderDiv, modalImageContainer.firstChild);
  }
  
  // Update description and specs
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
    
    // Clean up placeholder if it exists
    const placeholder = document.getElementById('modalImagePlaceholder');
    if (placeholder) {
      placeholder.remove();
    }
    
    // Reset image element
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
      modalImage.src = '';
      modalImage.style.display = 'none';
    }
  }
}

// Initialize facility cards when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add click handlers to facility cards
  document.querySelectorAll('.facility-card').forEach(card => {
    card.addEventListener('click', function() {
      const facilityId = this.getAttribute('data-facility');
      console.log('Facility card clicked:', facilityId); // Debug log
      if (facilityId) {
        openFacilityModal(facilityId);
      }
    });
  });

  // Use event delegation for room links since they might be on different pages
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('room-link')) {
      e.preventDefault();
      const facilityId = e.target.getAttribute('data-facility');
      console.log('Room link clicked via delegation:', facilityId); // Debug log
      if (facilityId) {
        openFacilityModal(facilityId);
      }
    }
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