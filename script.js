// Every clothing layer uses the same 400 × 600 canvas as the original artwork.
const categories = ['body', 'skin', 'hair', 'shirt', 'pants', 'shoes', 'accessory'];
const layerOrder = ['pants', 'shoes', 'shirt', 'hair', 'accessory'];
const catalog = [
  ['body','standard','Original build','assets/character.png'],['body','curvy','Curvy sample','assets/placeholders/bodies/curvy-original.svg'],['body','broad','Broad sample','assets/placeholders/bodies/broad-original.svg'],
  ['skin','original','Original','assets/character.png'],['skin','warm','Warm','assets/skin1.png'],['skin','olive','Olive','assets/skin2.png'],
  ['skin','porcelain','Porcelain sample','assets/placeholders/bodies/standard-porcelain.svg'],
  ['skin','peach','Peach sample','assets/placeholders/bodies/standard-peach.svg'],
  ['skin','golden','Golden sample','assets/placeholders/bodies/standard-golden.svg'],
  ['skin','umber','Umber sample','assets/placeholders/bodies/standard-umber.svg'],
  ['skin','espresso','Espresso sample','assets/placeholders/bodies/standard-espresso.svg'],
  ['skin','deep','Deep sample','assets/placeholders/bodies/standard-deep.svg'],
  ['hair','swoop','Side swoop','assets/hair.png'],['hair','bob','Rose bob','assets/placeholders/bob.svg'],
  ['shirt','tee','Soft tee','assets/shirt.png'],['shirt','cardigan','Sage cardigan','assets/placeholders/cardigan.svg'],['shirt','blouse','Ribbon blouse','assets/placeholders/blouse.svg'],
  ['pants','shorts','Denim shorts','assets/pants.png'],['pants','skirt','Pleated skirt','assets/placeholders/skirt.svg'],
  ['shoes','boots','Brown boots','assets/shoes.png'],['shoes','flats','Mary Janes','assets/placeholders/flats.svg'],
  ['accessory','bow','Hair ribbon','assets/placeholders/bow.svg'],['accessory','necklace','Heart necklace','assets/placeholders/necklace.svg']
].map(([type,id,name,src])=>({type,id,name,src,placeholder:src.endsWith('.svg')}));
const $ = id => document.getElementById(id);
const STORAGE_KEY='dresscode-studio-v1';
const defaults=()=>({body:'standard',skin:'original'});
let storyReady=false;
let outfit=defaults(), looks=[], backdrop='rose', activeCategory='shirt', history=[];
function validOutfit(value){const clean=defaults();if(value && typeof value==='object')for(const type of categories){const item=catalog.find(i=>i.type===type&&i.id===value[type]);if(item)clean[type]=item.id;}return clean;}
try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved){outfit=validOutfit(saved.outfit);looks=Array.isArray(saved.looks)?saved.looks.filter(l=>l&&typeof l.name==='string').slice(0,12).map(l=>({name:l.name.slice(0,32),outfit:validOutfit(l.outfit)})):[];if(['rose','sage','cream'].includes(saved.backdrop))backdrop=saved.backdrop;}}catch{/* Storage may be disabled or contain an older format. */}
function status(message){$('status').textContent=message;}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({outfit,looks,backdrop}));return true;}catch{status('Browser storage is unavailable. You can still play and download your outfit.');return false;}}
function checkpoint(){history.push({...outfit});if(history.length>30)history.shift();}
function itemFor(type){return catalog.find(i=>i.type===type&&i.id===outfit[type]);}
// Separate artwork can later replace each body/skin pair without changing saved IDs.
function baseSource(){return outfit.body==='standard' && ['original','warm','olive'].includes(outfit.skin)?itemFor('skin').src:`assets/placeholders/bodies/${outfit.body}-${outfit.skin}.svg`;}
function fitScale(src){if(src.includes('eyes')||src.includes('hair')||src.includes('bob')||src.includes('bow'))return 1;return {standard:1,curvy:1.14,broad:1.2}[outfit.body]||1;}
function render(){
 $('character-base').src=baseSource();
 $('body-note').hidden=outfit.body==='standard';
 $('dressed-items').replaceChildren();
 // Eyes are a permanent face layer; clothing order never depends on click order.
 for(const src of ['assets/eyes.png',...layerOrder.map(type=>itemFor(type)?.src).filter(Boolean)]){const img=document.createElement('img');img.src=src;img.alt='';img.className='dressed-item';img.style.transform=`scaleX(${fitScale(src)})`;$('dressed-items').append(img);}
 $('stage').dataset.backdrop=backdrop;$('backdrop').value=backdrop;$('undo-btn').disabled=!history.length;
 $('outfit-code').textContent='const outfit = '+JSON.stringify(outfit,null,2)+';';
 showItems(activeCategory);
 if(storyReady)renderStory();
}
function showItems(category){
 activeCategory=category;
 document.querySelectorAll('.menu-btn').forEach(btn=>{const selected=btn.dataset.category===category;btn.classList.toggle('active',selected);btn.setAttribute('aria-pressed',selected);});
 const labels={body:'Body types',skin:'Skin tones',hair:'Hair styles',shirt:'Tops',pants:'Bottoms',shoes:'Shoes',accessory:'Finishing touches'};
 $('items-title').textContent=labels[category];$('items-list').replaceChildren();
 $('remove-btn').disabled=['skin','body'].includes(category)||!outfit[category];
 const items=catalog.filter(i=>i.type===category);$('item-count').textContent=items.length+' pieces';
 for(const item of items){const btn=document.createElement('button');btn.className='item-card';btn.classList.toggle('selected',outfit[category]===item.id);btn.setAttribute('aria-pressed',outfit[category]===item.id);btn.draggable=true;
 // Crop previews only; fitted artwork keeps its full shared canvas.
 const bounds={body:[95,25,210,575],skin:[100,25,200,575],hair:[140,25,120,130],shirt:[115,140,165,120],pants:[120,240,160,140],shoes:[130,445,155,150],accessory:item.id==='bow'?[135,25,125,90]:[150,135,100,65]};
 const [x,y,w,h]=bounds[category];
 const preview=document.createElementNS('http://www.w3.org/2000/svg','svg');preview.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);preview.setAttribute('aria-hidden','true');preview.style.cssText='width:100%;height:98px;display:block';
 const image=document.createElementNS('http://www.w3.org/2000/svg','image');image.setAttribute('href',item.src);image.setAttribute('width','400');image.setAttribute('height','600');preview.append(image);
 const name=document.createElement('span');name.textContent=item.name;btn.append(preview,name);if(item.placeholder){const tag=document.createElement('small');tag.textContent='Sample piece';btn.append(tag);}
 btn.addEventListener('click',()=>equip(item));btn.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',item.id);e.dataTransfer.effectAllowed='copy';});$('items-list').append(btn);}
}
function equip(item){if(outfit[item.type]===item.id)return;checkpoint();outfit[item.type]=item.id;render();status(item.name+' equipped.');persist();}
function renderLooks(){ $('saved-looks').replaceChildren();if(!looks.length){const p=document.createElement('p');p.className='empty';p.textContent='Save a favorite outfit to wear it again.';$('saved-looks').append(p);}
 looks.forEach((look,index)=>{const row=document.createElement('div');row.className='saved-look';const load=document.createElement('button');load.className='quiet';load.textContent=look.name;load.onclick=()=>{checkpoint();outfit={...look.outfit};render();status('Wearing '+look.name+'.');persist();};const remove=document.createElement('button');remove.className='quiet';remove.textContent='×';remove.setAttribute('aria-label','Delete '+look.name);remove.onclick=()=>{looks.splice(index,1);renderLooks();status('Look removed.');persist();};row.append(load,remove);$('saved-looks').append(row);});}
$('start-btn').onclick=()=>enterMode('studio');
$('home-btn').onclick=()=>{$('main-screen').hidden=false;$('game-container').hidden=true;$('start-btn').focus();};
document.querySelectorAll('.menu-btn').forEach(btn=>btn.onclick=()=>showItems(btn.dataset.category));
$('remove-btn').onclick=()=>{if(['skin','body'].includes(activeCategory)||!outfit[activeCategory])return;checkpoint();delete outfit[activeCategory];render();status('Piece removed.');persist();};
$('reset-btn').onclick=()=>{checkpoint();outfit=defaults();render();status('Fresh canvas. Your saved looks are still here.');persist();};
$('undo-btn').onclick=()=>{if(!history.length)return;outfit=history.pop();render();status('Last outfit change undone.');persist();};
$('shuffle-btn').onclick=()=>{checkpoint();for(const type of categories.filter(type=>!['body','skin'].includes(type))){const choices=catalog.filter(i=>i.type===type);outfit[type]=choices[Math.floor(Math.random()*choices.length)].id;}render();status('A new outfit combination, just for you.');persist();};
$('backdrop').onchange=e=>{backdrop=e.target.value;render();persist();};
$('save-form').onsubmit=e=>{e.preventDefault();const name=$('look-name').value.trim();if(!name){status('Give your look a name first.');return;}if(looks.length>=12){status('Your lookbook holds 12 looks. Remove one to save another.');return;}looks.push({name,outfit:{...outfit}});$('look-name').value='';renderLooks();status('Saved '+name+'.');persist();};
$('stage').ondragover=e=>{e.preventDefault();$('stage').classList.add('drag-over');};
$('stage').ondragleave=()=> $('stage').classList.remove('drag-over');
$('stage').ondrop=e=>{e.preventDefault();$('stage').classList.remove('drag-over');const item=catalog.find(i=>i.id===e.dataTransfer.getData('text/plain'));if(item)equip(item);};
async function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});}
$('export-btn').onclick=async()=>{const button=$('export-btn');button.disabled=true;status('Preparing your outfit…');try{const sources=[baseSource(),'assets/eyes.png',...layerOrder.map(type=>itemFor(type)?.src).filter(Boolean)];const images=await Promise.all(sources.map(loadImage));const canvas=document.createElement('canvas');canvas.width=400;canvas.height=600;const ctx=canvas.getContext('2d');ctx.fillStyle={rose:'#f5dcd8',sage:'#d9e3d4',cream:'#eedeb9'}[backdrop];ctx.fillRect(0,0,400,600);images.forEach((img,index)=>{const scale=index===0?1:fitScale(sources[index]);ctx.save();ctx.translate(200,0);ctx.scale(scale,1);ctx.drawImage(img,-200,0,400,600);ctx.restore();});const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Export failed');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='dresscode-outfit.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Your outfit is ready to keep.');}catch{status('Could not download the outfit. Try running the game through a local web server.');}finally{button.disabled=false;}};
render();renderLooks();

const SETTINGS_KEY='dresscode-accessibility-v1';
const preferenceDefaults=()=>({contrast:false,text:false,motion:false,simple:false});
let preferences=preferenceDefaults();
try{const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY));if(saved)for(const key of Object.keys(preferences))preferences[key]=saved[key]===true;}catch{}
function applyPreferences(){const names={contrast:'contrast',text:'largeText',motion:'reduceMotion',simple:'simpleBackground'};for(const [key,attribute] of Object.entries(names)){document.documentElement.dataset[attribute]=String(preferences[key]);$('setting-'+key).checked=preferences[key];}}
function savePreferences(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(preferences));}catch{status('Preferences applied for this visit; browser storage is unavailable.');}}
let settingsOpener=$('settings-btn');
function openSettings(opener){settingsOpener=opener;$('settings-dialog').showModal();}
$('settings-btn').onclick=()=>openSettings($('settings-btn'));
$('home-settings-btn').onclick=()=>openSettings($('home-settings-btn'));
$('close-settings').onclick=()=>$('settings-dialog').close();
$('settings-dialog').addEventListener('close',()=>{if(!$('tutorial-dialog').open)settingsOpener.focus();});
for(const key of Object.keys(preferences))$('setting-'+key).onchange=e=>{preferences[key]=e.target.checked;applyPreferences();savePreferences();};
$('reset-settings').onclick=()=>{preferences=preferenceDefaults();applyPreferences();savePreferences();};
applyPreferences();


// Style Stories is a tiny learning game. Code is matched against a lesson grammar;
// player input is never executed with eval or Function.
const chapters=[
 {title:'Chapter 1 · The café invitation',description:'Your friend June is opening a tiny café. Put together a look for the first afternoon, then choose a finishing touch with a variable.',label:'Lesson 1: choose a variable value',explanation:'A string is text inside quotes. Declare accessory with either "bow" or "necklace". Running it equips your choice.',starter:'const accessory = "";',hint:'Try: const accessory = "bow";\nYou can also choose "necklace".',requirements:[['shirt','Choose any top'],['pants','Choose any bottom'],['shoes','Choose any shoes'],['accessory','Add a bow or necklace']],success:'June loves the look you brought to her opening. You used a variable to choose an accessory!'},
 {title:'Chapter 2 · A gallery after hours',description:'The café crew invites you to a community art show. Build a new look and use an array to list the three wardrobe categories in your outfit checklist.',label:'Lesson 2: build an array',explanation:'An array stores a list. Declare essentials with "shirt", "pants", and "shoes", in any order. The checklist will inspect your current outfit.',starter:'const essentials = [];',hint:'Try: const essentials = ["shirt", "pants", "shoes"];',requirements:[['shirt','Choose any top for the gallery'],['pants','Choose any bottom'],['shoes','Choose any shoes']],success:'Your gallery outfit is ready. An array helped you organize a checklist of categories!'},
 {title:'Chapter 3 · Rain at the night market',description:'Your last stop is a cozy outdoor market. The forecast says rainy. Use a conditional to equip boots, then finish a look for your evening out.',label:'Lesson 3: respond to a condition',explanation:'weather is already "rainy". Write an if statement that checks weather === "rainy" and sets outfit.shoes = "boots". === compares values; = assigns a value.',starter:'if (weather === "") {\n  outfit.shoes = "";\n}',hint:'Try:\nif (weather === "rainy") {\n  outfit.shoes = "boots";\n}',requirements:[['shirt','Choose any top'],['pants','Choose any bottom'],['shoes','Wear the brown boots','boots']],success:'You made it to the market! You learned variables, arrays, and conditionals—and styled three adventures.'}
];
const STORY_KEY='dresscode-stories-v1';
let mode='studio',story={chapter:0,completed:[],solved:[],drafts:[]};
try{const saved=JSON.parse(localStorage.getItem(STORY_KEY));if(saved&&typeof saved==='object'){for(let i=0;i<chapters.length;i++){if(Array.isArray(saved.completed)&&saved.completed.includes(i)&&story.completed.length===i)story.completed.push(i);else break;}story.solved=Array.isArray(saved.solved)?saved.solved.filter(i=>Number.isInteger(i)&&i>=0&&i<chapters.length):[];story.chapter=Number.isInteger(saved.chapter)?Math.max(0,Math.min(saved.chapter,story.completed.length,chapters.length-1)):0;story.drafts=Array.isArray(saved.drafts)?saved.drafts.slice(0,chapters.length).map(v=>typeof v==='string'?v.slice(0,1000):''):[];}}catch{}
function saveStory(){try{localStorage.setItem(STORY_KEY,JSON.stringify(story));}catch{status('Story progress will last for this visit; browser storage is unavailable.');}}
function enterMode(nextMode){mode=nextMode;$('main-screen').hidden=true;$('game-container').hidden=false;$('mode-label').textContent=mode==='story'?'Style Stories · Learn & dress':'Style Studio · Freeplay';$('switch-mode-btn').textContent=mode==='story'?'Return to Style Studio':'Try Style Stories';$('story-panel').hidden=mode!=='story';if(mode==='story'){loadChapter();$('story-title').focus();}else{$('home-btn').focus();}status(mode==='story'?'Welcome to Style Stories. Start with the brief, then try the code.':'Style Studio is yours to explore.');}
$('story-btn').onclick=()=>enterMode('story');$('switch-mode-btn').onclick=()=>enterMode(mode==='story'?'studio':'story');
function objectiveMet([type,,id]){return id?outfit[type]===id:Boolean(outfit[type]);}
function renderStory(){if(mode!=='story')return;const chapter=chapters[story.chapter];$('story-objectives').replaceChildren();for(const requirement of chapter.requirements){const li=document.createElement('li');const done=objectiveMet(requirement);li.textContent=(done?'✓ ':'○ ')+requirement[1];li.className=done?'objective-done':'';$('story-objectives').append(li);}const completed=story.completed.includes(story.chapter);$('story-badge').textContent=completed?'Chapter complete':story.solved.includes(story.chapter)?'Code solved':'Code to discover';$('previous-chapter').disabled=story.chapter===0;$('next-chapter').hidden=!completed||story.chapter===chapters.length-1;$('finish-chapter').textContent=completed?'Check this look again':'Check my outfit';}
function loadChapter(){const chapter=chapters[story.chapter];$('chapter-progress').textContent=`CHAPTER ${story.chapter+1} OF ${chapters.length} · ${story.completed.length} COMPLETE`;$('story-title').textContent=chapter.title;$('story-description').textContent=chapter.description;$('challenge-label').textContent=chapter.label;$('challenge-explanation').textContent=chapter.explanation;$('challenge-code').value=story.drafts[story.chapter]??chapter.starter;$('challenge-code').maxLength=1000;$('challenge-hint').textContent=chapter.hint;$('challenge-hint').hidden=true;$('challenge-hint-btn').textContent='Show hint';$('challenge-feedback').textContent=story.solved.includes(story.chapter)?'You have solved this lesson. You can run it again.':'';$('story-feedback').textContent=story.completed.includes(story.chapter)?chapter.success:'';renderStory();}
$('challenge-code').addEventListener('input',()=>{story.drafts[story.chapter]=$('challenge-code').value;saveStory();});
$('challenge-hint-btn').onclick=()=>{const hidden=!$('challenge-hint').hidden;$('challenge-hint').hidden=hidden;$('challenge-hint-btn').textContent=hidden?'Show hint':'Hide hint';};
function solveLesson(index,code){if(typeof code!=='string'||code.length>1000)return {ok:false,message:'Keep your answer under 1,000 characters.'};
 if(index===0){const match=code.trim().match(/^const\s+accessory\s*=\s*(["'])(bow|necklace)\1\s*;?$/);if(!match)return {ok:false,message:'Use const accessory = "bow"; or choose "necklace". Check your quotes and the equals sign.'};return {ok:true,item:match[2],message:'Variable created! Your '+match[2]+' is now equipped.'};}
 if(index===1){const match=code.trim().match(/^const\s+essentials\s*=\s*(\[[\s\S]*\])\s*;?$/);if(!match)return {ok:false,message:'Declare const essentials = [...]; with the three quoted category names.'};let list;try{list=JSON.parse(match[1].replace(/'([^']*)'/g,'"$1"'));}catch{return {ok:false,message:'Put quotes around each category and commas between them.'};}if(!Array.isArray(list)||list.length!==3||new Set(list).size!==3||!['shirt','pants','shoes'].every(type=>list.includes(type)))return {ok:false,message:'Include "shirt", "pants", and "shoes" exactly once. These are category names, not item names.'};return {ok:true,message:'Array created! Your three categories are now checked against the outfit you are wearing.'};}
 if(index===2){const match=code.trim().match(/^if\s*\(\s*weather\s*===\s*(["'])rainy\1\s*\)\s*\{\s*outfit\.shoes\s*=\s*(["'])boots\2\s*;?\s*\}$/);if(!match)return {ok:false,message:'Compare weather to "rainy" with ===, then assign "boots" to outfit.shoes inside the braces.'};return {ok:true,item:'boots',message:'The condition is true: it is rainy, so your boots are equipped.'};}
 return {ok:false,message:'Choose a story chapter first.'};}
$('challenge-form').onsubmit=e=>{e.preventDefault();const result=solveLesson(story.chapter,$('challenge-code').value);if(result.ok){if(result.item)equip(catalog.find(i=>i.id===result.item));if(!story.solved.includes(story.chapter))story.solved.push(story.chapter);story.drafts[story.chapter]=$('challenge-code').value;saveStory();renderStory();}$('challenge-feedback').textContent=result.message;};
$('finish-chapter').onclick=()=>{const chapter=chapters[story.chapter];if(!story.solved.includes(story.chapter)){$('story-feedback').textContent='Try the little coding lesson first. Hints are there whenever you need them.';return;}const missing=chapter.requirements.filter(r=>!objectiveMet(r));if(missing.length){$('story-feedback').textContent='Almost there: '+missing.map(r=>r[1].toLowerCase()).join(', ')+'.';return;}if(!story.completed.includes(story.chapter))story.completed.push(story.chapter);saveStory();$('story-feedback').textContent=chapter.success;renderStory();$('chapter-progress').textContent=`CHAPTER ${story.chapter+1} OF ${chapters.length} · ${story.completed.length} COMPLETE`;if(story.chapter===chapters.length-1){$('story-feedback').textContent+=' Your adventures are complete. Replay chapters or return to Style Studio whenever you like.';}};
$('next-chapter').onclick=()=>{if(story.completed.includes(story.chapter)&&story.chapter<chapters.length-1){story.chapter++;saveStory();loadChapter();$('story-title').focus();}};
$('previous-chapter').onclick=()=>{if(story.chapter>0){story.chapter--;saveStory();loadChapter();$('story-title').focus();}};
const tutorialSteps=[
 ['Welcome to DressCode','Choose Style Studio to dress freely, or Style Stories to follow three short themed adventures with beginner coding lessons. You can switch modes without losing your outfit.'],
 ['Make a character your own','Use Body and Skin to choose your character. Every body and skin tone works in either mode. Sample artwork is temporary; some clothing fits are approximate. Shuffle preserves these choices.'],
 ['Build a look','Choose a wardrobe category, then tap a piece. Keyboard users can Tab to a piece and press Enter or Space. Desktop players can also drag pieces into the fitting room. Remove piece takes off the selected category; Undo reverses an outfit edit.'],
 ['Keep your favorites','Name an outfit and press Save look. Select its name to wear it again. Download PNG keeps an image. Looks and progress stay in this browser; clearing browser data removes them.'],
 ['Try a Style Story','Read the styling brief, dress your character, and type the short code in the lesson box. Run code checks your answer and may equip a piece. Show hint gives an example. Check my outfit completes the chapter once the code and brief are ready. No timers or appearance scores.'],
 ['Play comfortably','Settings lets you increase contrast or text size, reduce motion, and simplify backgrounds. Reopen this tutorial any time from Settings. Use Tab to move between controls, and Escape to close a dialog. Have fun making something yours!']
];
let tutorialStep=0;
function renderTutorial(){const [title,content]=tutorialSteps[tutorialStep];$('tutorial-progress').textContent=`STEP ${tutorialStep+1} OF ${tutorialSteps.length}`;$('tutorial-title').textContent=title;$('tutorial-content').textContent=content;$('tutorial-back').disabled=tutorialStep===0;$('tutorial-next').textContent=tutorialStep===tutorialSteps.length-1?'Done':'Next →';$('tutorial-title').focus();}
$('tutorial-btn').onclick=()=>{tutorialStep=0;$('settings-dialog').close();$('tutorial-dialog').showModal();renderTutorial();};
$('close-tutorial').onclick=()=>$('tutorial-dialog').close();
$('tutorial-dialog').addEventListener('close',()=>{if(!$('settings-dialog').open)$('settings-dialog').showModal();$('tutorial-btn').focus();});
$('tutorial-back').onclick=()=>{if(tutorialStep>0){tutorialStep--;renderTutorial();}};
$('tutorial-next').onclick=()=>{if(tutorialStep<tutorialSteps.length-1){tutorialStep++;renderTutorial();}else $('tutorial-dialog').close();};
storyReady=true;
