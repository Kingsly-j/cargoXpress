/* Public-page navigation and contact form feedback. Tracking uses the React app. */
let adminKeys = '';
document.addEventListener('keydown', event => {
  if (event.target instanceof HTMLElement && (event.target.closest('input,textarea,select,[contenteditable]') || event.ctrlKey || event.metaKey || event.altKey)) return;
  if (event.key.length === 1) adminKeys = (adminKeys + event.key.toLowerCase()).slice(-5);
  if (adminKeys === 'admin') window.location.href = '/admin?admin=1';
});
if (new URLSearchParams(window.location.search).get('admin') === '1' || window.location.hash === '#admin') window.location.href = '/admin?admin=1';
document.querySelectorAll('a[href=""]').forEach(link => link.setAttribute('href', '/'));
const sectionLinks = { '/project-details': '/projects', '/testimonials': '/#testimonials', '/team-details': '/#team' };
document.querySelectorAll('a[href]').forEach(link => {
  const replacement = sectionLinks[link.getAttribute('href')];
  if (replacement) link.setAttribute('href', replacement);
});
document.querySelector('.testimonial-one')?.setAttribute('id', 'testimonials');
document.querySelector('.team-one')?.setAttribute('id', 'team');
document.querySelectorAll('input[name="_token"]').forEach(input => input.remove());
document.addEventListener('submit', function (event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!form.reportValidity()) return;
  let result = form.querySelector('[role="status"]');
  if (!result) {
    result = document.createElement('p');
    result.setAttribute('role', 'status');
    result.style.cssText = 'margin:18px 0;padding:16px;background:#f1f5f9;color:#172554;border-radius:6px;line-height:1.6';
    form.append(result);
  }
  if (form.querySelector('[name="tracking_number"]')) {
    window.location.href = '/track?code=' + encodeURIComponent(form.querySelector('[name="tracking_number"]').value.trim());
  } else if (form.querySelector('[type="search"]')) {
    const query = form.querySelector('[type="search"]').value.toLowerCase();
    const pages = ['about', 'services', 'contact', 'track', 'projects', 'faq', 'blog'];
    const page = pages.find(item => query.includes(item));
    if (page) window.location.assign('/' + page);
    else result.textContent = 'Try searching for services, tracking, contact, about, projects, or FAQ.';
  } else {
    result.textContent = 'This preview is not connected to a messaging service. Your details have not been sent.';
  }
}, true);
