const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
$('#year').textContent = new Date().getFullYear();
const modal=$('#tool-modal'), controls=$('#tool-controls'), status=$('#tool-status'), copyBtn=$('#copy-result');
let activeTool='', result='';
const definitions={
 word:['Word Counter','Count words, characters, sentences and paragraphs.'],
 case:['Case Converter','Convert your text into uppercase, lowercase, title case or sentence case.'],
 spaces:['Remove Extra Spaces','Trim spaces, collapse repeated spaces and remove unnecessary blank lines.'],
 slug:['Slug Generator','Turn a title or phrase into a clean URL-friendly slug.'],
 reverse:['Text Reverser','Reverse every character or reverse the order of words.'],
 sort:['Line Sorter','Sort lines alphabetically and optionally remove duplicate lines.'],
 json:['JSON Formatter','Validate and format JSON with readable indentation.'],
 url:['URL Encoder / Decoder','Encode text for URLs or decode percent-encoded text.'],
 base64:['Base64 Converter','Encode text to Base64 or decode Base64 back to text.'],
 password:['Password Generator','Create a strong random password using your selected options.'],
 uuid:['UUID Generator','Generate random UUID version 4 identifiers.'],
 lorem:['Lorem Ipsum Generator','Generate placeholder paragraphs for mockups and layouts.']
};
function field(label,id,placeholder='',textarea=true){return `<label class="field-label" for="${id}">${label}</label>${textarea?`<textarea class="tool-input textarea" id="${id}" placeholder="${placeholder}"></textarea>`:`<input class="tool-input" id="${id}" placeholder="${placeholder}">`}`}
function setup(id){activeTool=id;result='';copyBtn.disabled=true;status.textContent='';$('#modal-title').textContent=definitions[id][0];$('#modal-description').textContent=definitions[id][1];let html='';
 if(['word','case','spaces','slug','reverse','sort','json','url','base64'].includes(id)) html=field('Your text','source','Type or paste your text here...');
 if(id==='case') html+=`<label class="field-label" for="case-mode">Convert to</label><select class="tool-input" id="case-mode"><option value="upper">UPPERCASE</option><option value="lower">lowercase</option><option value="title">Title Case</option><option value="sentence">Sentence case</option></select>`;
 if(id==='reverse') html+=`<label class="field-label" for="reverse-mode">Reverse</label><select class="tool-input" id="reverse-mode"><option value="chars">Characters</option><option value="words">Word order</option></select>`;
 if(id==='sort') html+=`<div class="inline-fields"><label><input type="checkbox" id="unique"> Remove duplicate lines</label><label><input type="checkbox" id="descending"> Z to A</label></div>`;
 if(id==='json') html+=`<label class="field-label" for="indent">Indentation</label><select class="tool-input" id="indent"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option></select>`;
 if(id==='url'||id==='base64') html+=`<label class="field-label" for="direction">Action</label><select class="tool-input" id="direction"><option value="encode">Encode</option><option value="decode">Decode</option></select>`;
 if(id==='password') html=`<div class="inline-fields"><label>Length <input type="number" id="length" min="8" max="128" value="20"></label><label><input type="checkbox" id="lower" checked> Lowercase</label><label><input type="checkbox" id="upper" checked> Uppercase</label><label><input type="checkbox" id="numbers" checked> Numbers</label><label><input type="checkbox" id="symbols" checked> Symbols</label></div>`;
 if(id==='uuid') html=`<label class="field-label" for="count">Number of UUIDs (1–20)</label><input class="tool-input" type="number" id="count" min="1" max="20" value="1">`;
 if(id==='lorem') html=`<label class="field-label" for="paragraphs">Number of paragraphs (1–10)</label><input class="tool-input" type="number" id="paragraphs" min="1" max="10" value="3">`;
 html+=`<label class="field-label" for="output">Result</label><div id="output" class="tool-output" aria-live="polite">Your result will appear here.</div>`;controls.innerHTML=html;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
function run(){try{let input=$('#source')?.value||'', out='';switch(activeTool){
 case 'word':{let words=input.trim()?input.trim().split(/\s+/).length:0;let chars=input.length;let sentences=(input.match(/[.!?]+(?=\s|$)/g)||[]).length;let paragraphs=input.trim()?input.trim().split(/\n\s*\n/).length:0;out=`Words: ${words}\nCharacters (with spaces): ${chars}\nCharacters (without spaces): ${input.replace(/\s/g,'').length}\nSentences: ${sentences}\nParagraphs: ${paragraphs}`;break;}
 case 'case':{let mode=$('#case-mode').value;out=mode==='upper'?input.toUpperCase():mode==='lower'?input.toLowerCase():mode==='title'?input.toLowerCase().replace(/\b([a-z])/g,c=>c.toUpperCase()):input.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g,(m,a,b)=>a+b.toUpperCase());break;}
 case 'spaces':out=input.replace(/[\t ]+/g,' ').split('\n').map(x=>x.trim()).filter((x,i,a)=>x!==''|| (i>0&&a[i-1]!=='')).join('\n').trim();break;
 case 'slug':out=input.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');break;
 case 'reverse':out=$('#reverse-mode').value==='words'?input.trim().split(/\s+/).reverse().join(' '):Array.from(input).reverse().join('');break;
 case 'sort':{let lines=input.split(/\r?\n/);if($('#unique').checked)lines=[...new Set(lines)];lines.sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));if($('#descending').checked)lines.reverse();out=lines.join('\n');break;}
 case 'json':{let obj=JSON.parse(input);out=JSON.stringify(obj,$('#indent').value==='tab'?null:Number($('#indent').value));if($('#indent').value==='tab')out=JSON.stringify(obj,null,'\t');break;}
 case 'url':out=$('#direction').value==='encode'?encodeURIComponent(input):decodeURIComponent(input);break;
 case 'base64':out=$('#direction').value==='encode'?btoa(unescape(encodeURIComponent(input))):decodeURIComponent(escape(atob(input.trim())));break;
 case 'password':{let chars='';if($('#lower').checked)chars+='abcdefghijklmnopqrstuvwxyz';if($('#upper').checked)chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';if($('#numbers').checked)chars+='0123456789';if($('#symbols').checked)chars+='!@#$%^&*()-_=+[]{};:,.?';let len=Math.max(8,Math.min(128,Number($('#length').value)||20));if(!chars)throw Error('Select at least one character set.');let bytes=new Uint32Array(len);crypto.getRandomValues(bytes);out=Array.from(bytes,n=>chars[n%chars.length]).join('');break;}
 case 'uuid':{let n=Math.max(1,Math.min(20,Number($('#count').value)||1));out=Array.from({length:n},()=>crypto.randomUUID()).join('\n');break;}
 case 'lorem':{let n=Math.max(1,Math.min(10,Number($('#paragraphs').value)||3));let sample='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.';out=Array.from({length:n},()=>sample).join('\n\n');break;}
 }result=out;$('#output').textContent=out||'(No output)';copyBtn.disabled=!out;status.textContent='Done.';}catch(e){result='';$('#output').textContent='';copyBtn.disabled=true;status.textContent='Please check your input: '+e.message;}}
$('#run-tool').addEventListener('click',run);copyBtn.addEventListener('click',async()=>{if(!result)return;try{await navigator.clipboard.writeText(result);status.textContent='Copied to clipboard.';}catch{status.textContent='Copy is unavailable in this browser. Select the result and copy it.';}});$('#clear-tool').addEventListener('click',()=>{let s=$('#source');if(s)s.value='';let o=$('#output');if(o)o.textContent='Your result will appear here.';result='';copyBtn.disabled=true;status.textContent='';});
$$('[data-close]').forEach(el=>el.addEventListener('click',closeModal));function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';}document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
$$('.tool-card, .open-tool-btn').forEach(card=>card.addEventListener('click',()=>setup(card.dataset.tool)));
let category='All';function filter(){let q=$('#search').value.toLowerCase(),visible=0;$$('.tool-card').forEach(card=>{let show=(category==='All'||card.dataset.category===category)&&card.innerText.toLowerCase().includes(q);card.hidden=!show;if(show)visible++;});$('#no-results').hidden=visible>0;}$('#search').addEventListener('input',filter);$$('.category').forEach(btn=>btn.addEventListener('click',()=>{$$('.category').forEach(b=>b.classList.remove('active'));btn.classList.add('active');category=btn.dataset.category;filter();}));
