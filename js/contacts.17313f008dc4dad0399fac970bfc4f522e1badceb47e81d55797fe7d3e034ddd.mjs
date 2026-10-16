// Scraper friction, not encryption or access control. No network requests or storage.
export function decodeContact(encoded) {
  if (typeof encoded !== 'string' || encoded.length > 32768) throw new Error('Invalid contact');
  const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
  const contact = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (!contact || !['email', 'phone', 'compose'].includes(contact.kind) || typeof contact.value !== 'string')
    throw new Error('Invalid contact');
  if (contact.kind === 'phone') {
    if (!/^\+[1-9]\d{7,14}$/.test(contact.value)) throw new Error('Invalid phone');
  } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(contact.value)) {
    throw new Error('Invalid email');
  }
  if (contact.kind === 'compose' && (typeof contact.subject !== 'string' || typeof contact.body !== 'string' ||
      contact.subject.length > 200 || /[\r\n]/.test(contact.subject) || contact.body.length > 12000))
    throw new Error('Invalid draft');
  return contact;
}

export function contactHref(contact) {
  if (contact.kind === 'phone') return `tel:${contact.value}`;
  const address = `mailto:${contact.value}`;
  return contact.kind === 'compose'
    ? `${address}?subject=${encodeURIComponent(contact.subject)}&body=${encodeURIComponent(contact.body)}`
    : address;
}

export function activateContact(button, doc, navigate) {
  const contact = decodeContact(button.dataset.contact);
  if (contact.kind === 'compose') {
    navigate(contactHref(contact)); // Open a draft only; never send a message.
    return;
  }
  const link = doc.createElement('a');
  link.href = contactHref(contact);
  link.textContent = typeof contact.label === 'string' ? contact.label : contact.value;
  button.replaceWith(link);
  link.focus();
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', event => {
    const button = event.target?.closest?.('button[data-contact]');
    if (!button) return;
    try { activateContact(button, document, href => window.location.assign(href)); }
    catch {
      button.textContent = button.dataset.contactError;
      button.setAttribute('aria-live', 'polite');
    }
  });
}
