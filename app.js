
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const year = $('#year');
if (year) year.textContent = new Date().getFullYear();

const modal = $('#tool-modal');
const controls = $('#tool-controls');
const status = $('#tool-status');
const copyBtn = $('#copy-result');

let activeTool = '';
let result = '';

const definitions = {
  word: ['Word Counter', 'Count words, characters, sentences and paragraphs.'],
  case: ['Case Converter', 'Convert your text into uppercase, lowercase, title case or sentence case.'],
  spaces: ['Remove Extra Spaces', 'Trim spaces, collapse repeated spaces and remove unnecessary blank lines.'],
  slug: ['Slug Generator', 'Turn a title or phrase into a clean URL-friendly slug.'],
  reverse: ['Text Reverser', 'Reverse every character or reverse the order of words.'],
  sort: ['Line Sorter', 'Sort lines alphabetically and optionally remove duplicate lines.'],
  json: ['JSON Formatter', 'Validate and format JSON with readable indentation.'],
  url: ['URL Encoder / Decoder', 'Encode text for URLs or decode percent-encoded text.'],
  base64: ['Base64 Converter', 'Encode text to Base64 or decode Base64 back to text.'],
  password: ['Password Generator', 'Create a strong random password using your selected options.'],
  uuid: ['UUID Generator', 'Generate random UUID version 4 identifiers.'],
  lorem: ['Lorem Ipsum Generator', 'Generate placeholder paragraphs for mockups and layouts.']
};

function field(label, id, placeholder = '', textarea = true) {
  return `<label class="field-label" for="${id}">${label}</label>${
    textarea
      ? `<textarea class="tool-input textarea" id="${id}" placeholder="${placeholder}"></textarea>`
      : `<input class="tool-input" id="${id}" placeholder="${placeholder}">`
  }`;
}

function setup(id) {
  if (!definitions[id] || !modal || !controls) return;

  activeTool = id;
  result = '';

  if (copyBtn) copyBtn.disabled = true;
  if (status) status.textContent = '';

  $('#modal-title').textContent = definitions[id][0];
  $('#modal-description').textContent = definitions[id][1];

  let html = '';

  if (['word', 'case', 'spaces', 'slug', 'reverse', 'sort', 'json', 'url', 'base64'].includes(id)) {
    html = field('Your text', 'source', 'Type or paste your text here...');
  }

  if (id === 'case') {
    html += `
      <label class="field-label" for="case-mode">Convert to</label>
      <select class="tool-input" id="case-mode">
        <option value="upper">UPPERCASE</option>
        <option value="lower">lowercase</option>
        <option value="title">Title Case</option>
        <option value="sentence">Sentence case</option>
      </select>`;
  }

  if (id === 'reverse') {
    html += `
      <label class="field-label" for="reverse-mode">Reverse</label>
      <select class="tool-input" id="reverse-mode">
        <option value="chars">Characters</option>
        <option value="words">Word order</option>
      </select>`;
  }

  if (id === 'sort') {
    html += `
      <div class="inline-fields">
        <label><input type="checkbox" id="unique"> Remove duplicate lines</label>
        <label><input type="checkbox" id="descending"> Z to A</label>
      </div>`;
  }

  if (id === 'json') {
    html += `
      <label class="field-label" for="indent">Indentation</label>
      <select class="tool-input" id="indent">
        <option value="2">2 spaces</option>
        <option value="4">4 spaces</option>
        <option value="tab">Tab</option>
      </select>`;
  }

  if (id === 'url' || id === 'base64') {
    html += `
      <label class="field-label" for="direction">Action</label>
      <select class="tool-input" id="direction">
        <option value="encode">Encode</option>
        <option value="decode">Decode</option>
      </select>`;
  }

  if (id === 'password') {
    html = `
      <div class="inline-fields">
        <label>Length
          <input type="number" id="length" min="8" max="128" value="20">
        </label>
        <label><input type="checkbox" id="lower" checked> Lowercase</label>
        <label><input type="checkbox" id="upper" checked> Uppercase</label>
        <label><input type="checkbox" id="numbers" checked> Numbers</label>
        <label><input type="checkbox" id="symbols" checked> Symbols</label>
      </div>`;
  }

  if (id === 'uuid') {
    html = `
      <label class="field-label" for="count">Number of UUIDs (1–20)</label>
      <input class="tool-input" type="number" id="count" min="1" max="20" value="1">`;
  }

  if (id === 'lorem') {
    html = `
      <label class="field-label" for="paragraphs">Number of paragraphs (1–10)</label>
      <input class="tool-input" type="number" id="paragraphs" min="1" max="10" value="3">`;
  }

  html += `
    <label class="field-label" for="output">Result</label>
    <div id="output" class="tool-output" aria-live="polite">Your result will appear here.</div>`;

  controls.innerHTML = html;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function secureRandomInt(max) {
  if (!Number.isSafeInteger(max) || max < 1) {
    throw new Error('Invalid random number range.');
  }

  const range = 0x100000000;
  const limit = Math.floor(range / max) * max;
  const array = new Uint32Array(1);

  do {
    crypto.getRandomValues(array);
  } while (array[0] >= limit);

  return array[0] % max;
}

function securePassword(length, groups) {
  const allCharacters = groups.join('');

  if (!allCharacters) {
    throw new Error('Select at least one character set.');
  }

  if (length < groups.length) {
    throw new Error('Password length must be at least the number of selected character sets.');
  }

  const password = groups.map(group => group[secureRandomInt(group.length)]);

  for (let i = password.length; i < length; i++) {
    password.push(allCharacters[secureRandomInt(allCharacters.length)]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

function createUUID() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0'));

  return (
    hex.slice(0, 4).join('') + '-' +
    hex.slice(4, 6).join('') + '-' +
    hex.slice(6, 8).join('') + '-' +
    hex.slice(8, 10).join('') + '-' +
    hex.slice(10, 16).join('')
  );
}

function reverseCharacters(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return [...segmenter.segment(text)].map(item => item.segment).reverse().join('');
  }

  return Array.from(text).reverse().join('');
}

function countSentences(text) {
  if (!text.trim()) return 0;

  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'sentence' });
    return [...segmenter.segment(text)].filter(item => item.segment.trim()).length;
  }

  return (text.match(/[.!?]+(?=\s|$)/g) || []).length;
}

function run() {
  try {
    let input = $('#source')?.value || '';
    let out = '';

    switch (activeTool) {
      case 'word': {
        const words = input.trim() ? input.trim().split(/\s+/u).length : 0;
        const paragraphs = input.trim()
          ? input.trim().split(/\n\s*\n/).length
          : 0;

        out =
          `Words: ${words}\n` +
          `Characters (with spaces): ${input.length}\n` +
          `Characters (without spaces): ${input.replace(/\s/g, '').length}\n` +
          `Sentences: ${countSentences(input)}\n` +
          `Paragraphs: ${paragraphs}`;
        break;
      }

      case 'case': {
        const mode = $('#case-mode').value;

        out = mode === 'upper'
          ? input.toUpperCase()
          : mode === 'lower'
            ? input.toLowerCase()
            : mode === 'title'
              ? input.toLowerCase().replace(/\b([a-z])/g, c => c.toUpperCase())
              : input.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase());

        break;
      }

      case 'spaces': {
        out = input
          .replace(/[ \t]+/g, ' ')
          .split('\n')
          .map(line => line.trim())
          .filter((line, i, lines) => line !== '' || (i > 0 && lines[i - 1] !== ''))
          .join('\n')
          .trim();
        break;
      }

      case 'slug': {
        out = input.normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        break;
      }

      case 'reverse': {
        out = $('#reverse-mode').value === 'words'
          ? input.trim().split(/\s+/).reverse().join(' ')
          : reverseCharacters(input);
        break;
      }

      case 'sort': {
        let lines = input.split(/\r?\n/);

        if ($('#unique').checked) {
          lines = [...new Set(lines)];
        }

        lines.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

        if ($('#descending').checked) {
          lines.reverse();
        }

        out = lines.join('\n');
        break;
      }

      case 'json': {
        const obj = JSON.parse(input);
        const indent = $('#indent').value === 'tab' ? '\t' : Number($('#indent').value);
        out = JSON.stringify(obj, null, indent);
        break;
      }

      case 'url': {
        out = $('#direction').value === 'encode'
          ? encodeURIComponent(input)
          : decodeURIComponent(input);
        break;
      }

      case 'base64': {
        if ($('#direction').value === 'encode') {
          const bytes = new TextEncoder().encode(input);
          let binary = '';

          for (const byte of bytes) {
            binary += String.fromCharCode(byte);
          }

          out = btoa(binary);
        } else {
          const binary = atob(input.trim());
          const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
          out = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        }

        break;
      }

      case 'password': {
        const groups = [];

        if ($('#lower').checked) groups.push('abcdefghijklmnopqrstuvwxyz');
        if ($('#upper').checked) groups.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        if ($('#numbers').checked) groups.push('0123456789');
        if ($('#symbols').checked) groups.push('!@#$%^&*()-_=+[]{};:,.?');

        const lengthInput = Number($('#length').value);

        if (!Number.isInteger(lengthInput) || lengthInput < 8 || lengthInput > 128) {
          throw new Error('Choose a password length between 8 and 128.');
        }

        if (!groups.length) {
          throw new Error('Select at least one character set.');
        }

        out = securePassword(lengthInput, groups);
        break;
      }

      case 'uuid': {
        const count = Number($('#count').value);

        if (!Number.isInteger(count) || count < 1 || count > 20) {
          throw new Error('Choose between 1 and 20 UUIDs.');
        }

        out = Array.from({ length: count }, createUUID).join('\n');
        break;
      }

      case 'lorem': {
        const count = Number($('#paragraphs').value);

        if (!Number.isInteger(count) || count < 1 || count > 10) {
          throw new Error('Choose between 1 and 10 paragraphs.');
        }

        const sample = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.';

        out = Array.from({ length: count }, () => sample).join('\n\n');
        break;
      }

      default:
        throw new Error('Unknown tool.');
    }

    result = out;

    const output = $('#output');
    if (output) output.textContent = out || '(No output)';

    if (copyBtn) copyBtn.disabled = !out;
    if (status) status.textContent = 'Done.';
  } catch (error) {
    result = '';

    const output = $('#output');
    if (output) output.textContent = '';

    if (copyBtn) copyBtn.disabled = true;
    if (status) status.textContent = 'Please check your input: ' + error.message;
  }
}

$('#run-tool')?.addEventListener('click', run);

copyBtn?.addEventListener('click', async () => {
  if (!result) return;

  try {
    await navigator.clipboard.writeText(result);
    if (status) status.textContent = 'Copied to clipboard.';
  } catch {
    if (status) status.textContent = 'Copy is unavailable in this browser. Select the result and copy it.';
  }
});

$('#clear-tool')?.addEventListener('click', () => {
  if (controls) {
    $$('textarea, input, select', controls).forEach(element => {
      if (element.type === 'checkbox') {
        element.checked = element.defaultChecked;
      } else if (element.tagName === 'SELECT') {
        element.selectedIndex = 0;
      } else {
        element.value = element.defaultValue;
      }
    });
  }

  const output = $('#output');
  if (output) output.textContent = 'Your result will appear here.';

  result = '';

  if (copyBtn) copyBtn.disabled = true;
  if (status) status.textContent = '';
});

function closeModal() {
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

$$('[data-close]').forEach(element => {
  element.addEventListener('click', closeModal);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
});

$$('.tool-card, .open-tool-btn').forEach(card => {
  card.addEventListener('click', () => setup(card.dataset.tool));
});

// Homepage search and category filters
const search = $('#search');
const categoryButtons = $$('.category');

if (search && categoryButtons.length) {
  let category = 'All';

  function filterTools() {
    const query = search.value.toLowerCase();
    let visible = 0;

    $$('.tool-card').forEach(card => {
      const matchesCategory =
        category === 'All' || card.dataset.category === category;

      const matchesSearch =
        card.innerText.toLowerCase().includes(query);

      const show = matchesCategory && matchesSearch;

      card.hidden = !show;

      if (show) visible++;
    });

    const noResults = $('#no-results');
    if (noResults) noResults.hidden = visible > 0;
  }

  search.addEventListener('input', filterTools);

  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      categoryButtons.forEach(item => item.classList.remove('active'));
      button.classList.add('active');

      category = button.dataset.category;
      filterTools();
    });
  });
}
