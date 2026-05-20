// script.js

function updateClock() {
  const now = new Date();
  const clockEl = document.getElementById('clock');
  if (!clockEl) return;
  clockEl.textContent = now.toLocaleString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
}

setInterval(updateClock, 1000);
updateClock();

document.querySelectorAll('nav a').forEach(link => {
  if (link.href === location.href || location.pathname.endsWith(link.getAttribute('href'))) {
    link.classList.add('active');
  }
});

let registrations = [];
let feedbacks = [];

const getRegistrations = () => registrations;
const saveRegistrations = items => { registrations = items; };
const getFeedbacks = () => feedbacks;
const saveFeedbacks = items => { feedbacks = items; };

function initRegistrationPage() {
  const form = document.getElementById('regForm');
  if (!form) return;

  const countEl = document.getElementById('regCount');
  const listEl = document.getElementById('regList');

  function renderRegistrationList() {
    if (!listEl) return;
    const registrations = getRegistrations();
    if (!registrations.length) {
      listEl.innerHTML = '<div class="reg-item" style="color:var(--muted)">No registrations yet.</div>';
      return;
    }

    listEl.innerHTML = registrations
      .map(entry => `
        <div class="reg-item">
          <b>${entry.event}</b> — ${entry.name} (${entry.participantId})
          <div class="meta">Team: ${entry.teamName} | Members: ${entry.members}</div>
        </div>
      `)
      .join('');
  }

  function updateRegistrationCount() {
    if (!countEl) return;
    countEl.textContent = getRegistrations().length;
    renderRegistrationList();
  }

  updateRegistrationCount();

  form.addEventListener('submit', event => {
    event.preventDefault();
    const msg = document.getElementById('formMsg');
    const show = (text, type) => {
      if (!msg) return;
      msg.className = `msg ${type}`;
      msg.textContent = text;
      setTimeout(() => {
        msg.className = 'msg';
        msg.textContent = '';
      }, 4000);
    };

    const name = form.sname.value.trim();
    const participantId = form.regnum.value.trim();
    const email = form.email.value.trim();
    const mobile = form.mobile.value.trim();
    const eventName = form.ptitle.value.trim();
    const eventCategory = form.category.value;
    const teamName = form.teamname.value.trim();
    const department = form.dept.value.trim();
    const year = form.year.value;
    const members = parseInt(form.members.value, 10);

    if (!name || !/^[a-zA-Z ]{2,}$/.test(name)) return show('Enter a valid participant name.', 'error');
    if (!participantId || !/^[A-Za-z0-9-]{4,20}$/.test(participantId)) return show('Enter a valid participant ID.', 'error');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show('Enter a valid email address.', 'error');
    if (!mobile || !/^\d{10}$/.test(mobile)) return show('Enter a valid 10-digit mobile number.', 'error');
    if (!eventName) return show('Enter the sport or event name.', 'error');
    if (!eventCategory) return show('Select an event category.', 'error');
    if (!teamName) return show('Enter your team name.', 'error');
    if (!department) return show('Enter your department.', 'error');
    if (!year) return show('Select your year.', 'error');
    if (!members || members < 1 || members > 12) return show('Team size must be between 1 and 12.', 'error');

    if (eventCategory.includes('Closed')) return show(`Sorry, the ${eventCategory} category is closed.`, 'error');

    const registrations = getRegistrations();
    if (registrations.find(r => r.participantId === participantId && r.event === eventName)) {
      return show('This participant ID already has a registration for that event.', 'error');
    }
    if (registrations.find(r => r.participantId === participantId)) {
      return show('This participant ID is already used.', 'error');
    }

    registrations.push({
      name,
      participantId,
      email,
      mobile,
      event: eventName,
      category: eventCategory,
      teamName,
      department,
      year,
      members,
    });

    saveRegistrations(registrations);
    show(`Your ${eventName} registration is confirmed`, 'success');
    form.reset();
    updateRegistrationCount();
  });
}

function initFeedbackPage() {
  const form = document.getElementById('fbForm');
  if (!form) return;

  const listEl = document.getElementById('fbList');

  function renderFeedbacks() {
    if (!listEl) return;
    const feedbacks = getFeedbacks();
    if (!feedbacks.length) {
      listEl.innerHTML = '<p style="color:var(--muted);font-size:.85rem">No feedback yet.</p>';
      return;
    }

    const average = (feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length).toFixed(1);
    listEl.innerHTML = `
      <p style="font-size:.85rem;margin-bottom:.8rem;color:var(--muted)">
        Average Rating: <b style="color:var(--accent)">${average} </b> from ${feedbacks.length} responses
      </p>
    ` + feedbacks
      .map(item => `
        <div class="fb-card">
          <b>${item.name || 'Anonymous'}</b> (${item.participantId}) — ${item.event}
          <div class="stars-show">${'5'.repeat(item.rating)}${'1'.repeat(5 - item.rating)}</div>
          <p>${item.comment}</p>
        </div>
      `)
      .join('');
  }

  renderFeedbacks();

  form.addEventListener('submit', event => {
    event.preventDefault();
    const msg = document.getElementById('fbMsg');
    const show = (text, type) => {
      if (!msg) return;
      msg.className = `msg ${type}`;
      msg.textContent = text;
      setTimeout(() => {
        msg.className = 'msg';
        msg.textContent = '';
      }, 4000);
    };

    const name = form.fname.value.trim();
    const participantId = form.freg.value.trim();
    const eventAttended = form.fcategory.value;
    const rating = parseInt(form.querySelector('input[name="rating"]:checked')?.value || 0, 10);
    const comment = form.comment.value.trim();

    if (!participantId || !/^[A-Za-z0-9-]{4,20}$/.test(participantId)) return show('Enter a valid participant ID.', 'error');
    if (!eventAttended) return show('Select the event you attended.', 'error');
    if (!rating) return show('Please select a rating.', 'error');
    if (comment.length < 20) return show('Comment must be at least 20 characters.', 'error');

    const feedbacks = getFeedbacks();
    feedbacks.push({
      name,
      participantId,
      event: eventAttended,
      rating,
      comment,
    });

    saveFeedbacks(feedbacks);
    show('Thanks, Your sports meet feedback has been recorded.', 'success');
    form.reset();
    renderFeedbacks();
  });
}

initRegistrationPage();
initFeedbackPage();
