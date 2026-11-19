'use strict';
/* أيام المدينة — مغامرة تاريخية. كل الشخصيات خيالية، ولا تُجسَّد أي شخصية مقدسة ولا يُنسب قول للنبي ﷺ أو للصحابة. */
const $=i=>document.getElementById(i),R=Math.random,T=THREE,KEY='ayyam_madina_v1',COLS=[0x3b6e8f,0x7a3b3b,0x4f6b3f];

/* ====== بيانات القصة ======
 d: أسطر الحوار [المتكلم أو '' للسرد، النص، خيارات?] — الخيار: [النص، تأثير، ردّ?] */
const CH=[
{t:'الفصل الأول',s:'الحياة في المدينة المنورة',sky:0xe6c88e,fg:.005,sn:1.15,sp:[0,8],steps:[
 {o:'املأ قربة الماء من البئر',at:[-22,14],d:[['','تُنزل الدلو في البئر وتصعد بالماء البارد. صباح هادئ في المدينة، ورائحة الطين والنخيل تملأ الأزقة.']],give:{ماء:1}},
 {o:'حدّث التاجر مسعود في السوق',at:[30,8],n:['التاجر مسعود',0x7a5a3a],d:[['مسعود','أهلًا يا {name}. القوافل تتحدث عن أمر جلل، فكن مستعدًا دائمًا.'],['مسعود','هل توصل هذه التمرات إلى جارتنا العجوز؟',[['نعم، بكل سرور',{rel:1},'يبتسم مسعود ويضع في يدك حزمة من التمر.'],['لديّ عمل، سأحاول لاحقًا',{},'يهز مسعود رأسه متفهمًا.']]]],give:{تمر:2}},
 {o:'عُد إلى بيتك عند الغروب',at:[0,-4],d:[['','تعود إلى بيتك الطيني الصغير مع غروب الشمس. تعيش من عمل يديك، وتصلي مع أهل حيّك، وتعرف أسماء جيرانك واحدًا واحدًا.']]}]},
{t:'الفصل الثاني',s:'الأخبار والترقّب',sky:0xdcbd86,fg:.007,sn:1.05,sp:[0,6],steps:[
 {o:'قابل الراكب القادم بالخبر عند مدخل المدينة',at:[12,-30],n:['الراكب',0x5a4a3a],d:[['الراكب','جيش قريش خرج من مكة بعدده وعتاده، واقترب من المدينة ونزل قرب جبل أُحد.'],['','يُروى أن عدده نحو ثلاثة آلاف مقاتل. يسود الصمت بين من حولك.']]},
 {o:'اذهب إلى ساحة الاجتماع',at:[-10,-44],n:['شيخ الحي',0x888070],d:[['','تشاور أهل المدينة فيما يفعلون: أيبقون في المدينة أم يخرجون للقاء الجيش؟ وانتهى الأمر إلى الخروج.'],['شيخ الحي','لا نملك إلا التوكل والاستعداد يا {name}. فماذا في قلبك؟',[['سأخرج مع الناس',{sabr:1}],['أخشى على أهلي',{rel:1},'يقول الشيخ: «الخوف شعور بشري، لكن الصبر أنفع منه».']]]]},
 {o:'جهّز زادك في بيتك',at:[0,-4],d:[['','تحزم التمر والماء وعباءتك. يودّعك أهلك بالدعاء، ويخفق قلبك بين القلق والعزم.']],give:{تمر:2,ماء:1}}]},
{t:'الفصل الثالث',s:'الطريق إلى أُحد',sky:0xd9b77e,fg:.009,sn:1,sp:[0,-20],steps:[
 {o:'سِر شمالًا مع الناس',at:[0,-80],d:[['','تتحرك الجموع بين النخيل ثم الأرض المكشوفة. الشمس والغبار والعطش، والخطى تثقل شيئًا فشيئًا.']],fx:'tire'},
 {o:'ساعد شيخًا متعبًا على الطريق',at:[6,-110],n:['شيخ متعب',0x6a6a5a],d:[['شيخ متعب','أظنني لا أقوى على المسير... قد جفّ حلقي.',[['أعطيه ماءً من قربتي',{use:'ماء',sabr:1,rel:2},'يشرب ويدعو لك بالخير، ويمضي معك أخف خطى.'],['أواصل سيري',{},'تمضي وفي نفسك ثقل لا تعرف سببه.']]]]},
 {o:'انتبه: جماعة تعود أدراجها',at:[-10,-140],n:['رجل راجع',0x4a4038],d:[['','ذُكر في الصحيح أن طائفة رجعت في الطريق وبقي الباقون على المسير.'],['الرجل الراجع','لا أرى جدوى من هذا، سأعود. فهل تعود معي؟',[['أبقى مع الجماعة',{sabr:2}],['أتردد لحظة',{sabr:-1},'يثقل عليك الشك لحظة، ثم تنظر إلى من حولك فتمضي.']]]]}]},
{t:'الفصل الرابع',s:'مشارف الجبل',sky:0xcfa770,fg:.008,sn:1,sp:[0,-150],steps:[
 {o:'اصعد إلى مشارف الجبل',at:[10,-175],d:[['','ينفتح الأفق على جبل أُحد: كتلة حمراء داكنة من الصخر تمتد في الأفق، وسفوحه خشنة تتناثر عليها الحجارة. يقف المسلمون وظهرهم إلى الجبل.']]},
 {o:'اجلس مع الجماعة وتناول طعامًا',at:[-5,-168],n:['رفيق الرحلة',0x6a5a40],d:[['رفيق الرحلة','كُل شيئًا يا {name}، فغدًا يوم طويل.'],['','تتشاركون التمر في صمت. الرياح تحمل رائحة الغبار البعيد.']],fx:'rest'}]},
{t:'الفصل الخامس',s:'بداية المواجهة',sky:0xc9a06c,fg:.011,sn:.95,sp:[0,-175],steps:[
 {o:'احمل الماء إلى المقدمة',at:[-15,-195],n:['رجل ظمآن',0x6a4a3a],d:[['','التقى الجمعان، وارتفع غبار كثيف وصياح بعيد. تسري في جسدك رجفة الخوف.'],['رجل ظمآن','ماء... بالله عليك.',[['أسقيه من قربتي',{use:'ماء',sabr:1,rel:1},'يرتوي ويشدّ على يدك.'],['أخشى أن أبقى بلا ماء',{sabr:-1},'تتردد، ثم تعطيه جرعة صغيرة وتمضي.']]]],fx:'dust'},
 {o:'اجمع الضمادات من خيمة الإسعاف',at:[28,-182],d:[['','في الخيمة تُجمع الخِرَق والضمادات. تعدّ ما تحمل، فقد تحتاج إليه قريبًا.']],give:{ضماد:3}}]},
{t:'الفصل السادس',s:'تقلّبات اللقاء',sky:0xb98a5a,fg:.014,sn:.85,sp:[0,-185],steps:[
 {o:'اصعد التل لترى الميدان',at:[38,-188],d:[['','في أول الأمر كانت الغلبة للمسلمين وتراجعت صفوف قريش. ثم تغيّر الحال حين ترك بعض من على الجبل موقعهم، فالتفّ فرسان قريش من الخلف.'],['','ترى الغبار يعلو من جهة لم تكن تتوقعها، والصفوف تضطرب.']],fx:'dust'},
 {o:'ابتعد عن الغبار نحو الصخور',at:[-30,-205],d:[['','تركض بين الصخور والصوت من حولك يتداخل: صهيل وصياح وصرخات. تتعثر فتجرح يدك، لكنك تستمر.']],fx:'dmg'}]},
{t:'الفصل السابع',s:'الشدة والابتلاء',sky:0x9a7050,fg:.017,sn:.7,sp:[-30,-200],steps:[
 {o:'ساعد الجريح الأول',at:[-12,-200],n:['جريح',0x7a4a3a],d:[['جريح','يداي لا تتحركان... ساعدني.',[['أضمّد جرحه',{use:'ضماد',sabr:1,rel:1},'تلفّ الضماد بإحكام وتسنده إلى الصخرة.'],['أسقيه ماءً',{use:'ماء',rel:1},'يرتشف ويغمض عينيه مرتاحًا.']]]]},
 {o:'ساعد الجريح الثاني',at:[20,-210],n:['جريح',0x5a4a6a],d:[['جريح','لا تتركني هنا.',[['أحمله إلى موضع آمن',{sabr:1,en:-12,rel:1},'تحمله بجهد حتى تبلغ ظل الصخرة.'],['أضمّد جرحه',{use:'ضماد',rel:1},'تضغط على الجرح حتى يهدأ النزف.']]]]},
 {o:'اثبت حين يشتد الاضطراب',at:[0,-218],d:[['','ثم دوّى النداء بأن النبي ﷺ قد قُتل. وقع الخبر على القلوب ثقيلًا، وسقط بعضهم من الأسى.'],['','وفي قلبك صراع بين اليأس والثبات.',[['أثبت ولا أنهار',{sabr:2},'تتماسك رغم الألم وتواصل مساعدة من حولك.'],['أضعف وأحتار',{sabr:-1},'تجلس لحظة منهكًا، ثم تنهض مرغمًا.']]],['','ثم تبيّن أن النبي ﷺ حيّ، فاجتمع المسلمون وانحازوا إلى الجبل. تتنفس بعد طول انقباض.']],fx:'rest'}]},
{t:'الفصل الثامن',s:'انجلاء الغبار',sky:0xd88a5a,fg:.01,sn:.8,sp:[0,-215],steps:[
 {o:'اسقِ الجرحى عند السفح',at:[-5,-190],n:['جريح',0x7a5a4a],d:[['','انصرف جيش قريش عائدًا إلى مكة ولم يدخل المدينة. وقد استُشهد من المسلمين نحو سبعين.'],['جريح','أحمد الله أنك هنا.',[['أسقيه وأواسيه',{use:'ماء',rel:1}],['أجلس بجواره بصمت',{sabr:1},'تبقى معه حتى يستعيد أنفاسه.']]]]},
 {o:'قف مع الناس عند الشهداء',at:[15,-175],d:[['','دُفن الشهداء في موضعهم. تقف صامتًا بين الرجال وتدعو لهم بالرحمة. أثقل الأيام وأعلمها بالصبر.']]}]},
{t:'الفصل التاسع',s:'العودة والتأمل',sky:0x4a4560,fg:.007,sn:.4,sp:[0,-25],steps:[
 {o:'عُد إلى بيتك',at:[0,-4],n:['والدتك',0x6d3d52],d:[['','تعود إلى المدينة وقد تغيّرت الوجوه. بيوت فيها حزن، وبيوت فيها حمد، وأنت بين هذا وذاك.'],['والدتك','الحمد لله على سلامتك يا {name}. ماذا تعلّمتَ من هذه الأيام؟',[['أن الصبر مع العمل خير',{sabr:1}],['أن أشكر على النجاة وأعين الناس',{rel:1}]]]]}]}
];
const REFS=['صحيح البخاري، كتاب المغازي، باب غزوة أُحد.','صحيح مسلم، كتاب الجهاد والسير.','السيرة النبوية، لابن هشام.','تفسير ابن كثير، سورة آل عمران (الآيات 121–179).','الرحيق المختوم، صفي الرحمن المباركفوري.','السيرة النبوية الصحيحة، أكرم ضياء العمري.'];

/* ====== الحالة والمتغيرات ====== */
let S,scene,cam,ren,sun,hemi,pl,npc=null,mk,pts,fogBase=.006,cols=[],keys={},busy=false,on=false,yaw=0,dust=0,AU=null,cur=null,joy={x:0,y:0},run=false,bob=0,sel=0,clk=new T.Clock();
const NEW=()=>({name:'هاني',col:COLS[0],ch:0,st:0,hp:100,en:100,sta:100,inv:{تمر:3,ماء:1},sabr:0,rel:0,x:0,z:8});
const mat=(c,f)=>new T.MeshStandardMaterial({color:c,roughness:.95,flatShading:!!f});
function add(g,c,x,y,z,f){const m=new T.Mesh(g,mat(c,f));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);return m}

function figure(c,tb){const g=new T.Group(),P=(geo,col,x,y,z)=>{const o=new T.Mesh(geo,mat(col));o.position.set(x,y,z);o.castShadow=true;g.add(o);return o};
 P(new T.CylinderGeometry(.34,.5,1.4,10),c,0,1.05,0);P(new T.SphereGeometry(.25,12,10),0xb98560,0,1.95,0);P(new T.CylinderGeometry(.28,.3,.17,10),tb||0xe9e2d0,0,2.12,0);
 g.L=P(new T.CylinderGeometry(.12,.12,.8,6),0x3a2f25,-.18,.4,0);g.R=P(new T.CylinderGeometry(.12,.12,.8,6),0x3a2f25,.18,.4,0);return g}

/* ====== بناء العالم ====== */
function build(){
 const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');x.fillStyle='#c4a169';x.fillRect(0,0,256,256);
 for(let i=0;i<4500;i++){x.fillStyle=`rgba(${100+R()*80|0},${80+R()*60|0},${40+R()*40|0},.25)`;x.fillRect(R()*256,R()*256,2,2)}
 const tx=new T.CanvasTexture(cv);tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(120,140);
 const g=new T.Mesh(new T.PlaneGeometry(600,700),new T.MeshStandardMaterial({map:tx,roughness:1}));g.rotation.x=-Math.PI/2;g.position.z=-200;g.receiveShadow=true;scene.add(g);
 // بيوت المدينة
 [[0,-11],[-34,-8],[-45,8],[20,-14],[44,-6],[-20,-30],[40,-34],[-48,-26]].forEach(([hx,hz])=>{
  const w=5+R()*3,h=3.6+R()*1.2;add(new T.BoxGeometry(w,h,w),0xa98558,hx,h/2,hz);add(new T.BoxGeometry(w+.4,.4,w+.4),0x8a6a45,hx,h+.2,hz);
  add(new T.BoxGeometry(1.1,2,.2),0x3a2a1c,hx,1,hz+w/2+.05);cols.push([hx,hz,w*.75])});
 // بئر وأكشاك السوق
 add(new T.CylinderGeometry(1.3,1.5,1,12),0x9a8a70,-22,.5,14);cols.push([-22,14,1.8]);
 [[26,2],[34,2],[26,14],[36,13]].forEach(([sx,sz],i)=>{add(new T.BoxGeometry(.2,3,.2),0x5a3a20,sx,1.5,sz);add(new T.BoxGeometry(3.4,.1,2.6),[0xb04a3a,0x3a6a8a,0xc9a040,0x6a8a4a][i],sx,3.1,sz)});
 // نخيل
 for(let i=0;i<30;i++){const px=-65+R()*130,pz=-48+R()*80;if(Math.hypot(px,pz+5)<6||Math.hypot(px-30,pz-8)<10)continue;
  const h=6+R()*3;add(new T.CylinderGeometry(.22,.32,h,6),0x6a4a2a,px,h/2,pz);
  for(let k=0;k<6;k++){const l=add(new T.ConeGeometry(.5,4,4),0x3f6b2f,px+Math.cos(k)*1.6,h+.2,pz+Math.sin(k)*1.6);l.rotation.set(Math.sin(k)*1.1,0,-Math.cos(k)*1.1);l.scale.y=1}}
 // خيام المعسكر
 [[-12,-172],[12,-170],[28,-182],[-4,-182],[30,-170],[-20,-160]].forEach(([tx2,tz])=>{add(new T.ConeGeometry(3,3.4,6),0xdccfb0,tx2,1.7,tz);cols.push([tx2,tz,2.5])});
 // صخور وجبل
 for(let i=0;i<90;i++){const s=1+R()*2.4,r=add(new T.DodecahedronGeometry(s),0x8a6a50,-85+R()*170,s*.5,-60-R()*185,true);r.scale.y=.6+R()*.5;r.rotation.y=R()*6}
 for(let i=0;i<18;i++){const s=16+R()*10,m=add(new T.DodecahedronGeometry(s),i%2?0x8a5440:0x7a4a38,-140+i*17+R()*8,s*.8,-255-R()*20,true);m.scale.y=1.7+R()*.7;m.rotation.y=R()*6}
 add(new T.SphereGeometry(9,12,8),0x8a6a4a,40,0,-196,true).scale.y=.7;
 // أشرطة الغبار
 const N=420,pp=new Float32Array(N*3);for(let i=0;i<N*3;i++)pp[i]=(R()-.5)*50;
 pts=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(pp,3)),new T.PointsMaterial({color:0xd9bb88,size:.18,transparent:true,opacity:.15,depthWrite:false}));pts.frustumCulled=false;scene.add(pts);
 // علامة الهدف
 mk=new T.Mesh(new T.CylinderGeometry(.7,.7,30,16,1,true),new T.MeshBasicMaterial({color:0xffd070,transparent:true,opacity:.28,side:T.DoubleSide,depthWrite:false}));mk.position.y=15;scene.add(mk);
}

/* ====== الصوت (رياح بيئية بلا موسيقى) ====== */
function wind(){try{const c=new (window.AudioContext||window.webkitAudioContext)(),n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=R()*2-1;
 const s=c.createBufferSource();s.buffer=b;s.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=480;const g=c.createGain();g.gain.value=.05;s.connect(f);f.connect(g);g.connect(c.destination);s.start();AU={f,g}}catch(e){}}

/* ====== الحوار ====== */
function apply(e){if(e.use){if(S.inv[e.use]>0)S.inv[e.use]--;else{S.hp-=5;toast('لا تملك '+e.use+' فتمزّق طرف ثوبك وتتعب')}}
 for(const k in e){if(k==='use')continue;if(k==='hp'||k==='en')S[k]=Math.max(0,Math.min(100,S[k]+e[k]));else S[k]=(S[k]||0)+e[k]}}
function dlg(lines,done){lines=lines.slice();busy=true;let i=0;const box=$('dlg');box.classList.remove('hide');
 const next=()=>{if(i>=lines.length){box.classList.add('hide');busy=false;cur=null;done&&done();return}
  const [w,tx,ch]=lines[i++];$('who').textContent=w;box.classList.toggle('nar',!w);$('txt').textContent=tx.replace('{name}',S.name);const o=$('opts');o.innerHTML='';cur=null;
  if(ch){ch.forEach(c=>{const b=document.createElement('button');b.textContent=c[0];b.onclick=e=>{e.stopPropagation();apply(c[1]);if(c[2])lines.splice(i,0,['',c[2]]);next()};o.appendChild(b)})}else cur=next};
 box.onclick=()=>{if(cur)cur()};next()}
function toast(t){const e=$('toast');e.textContent=t;e.classList.remove('hide');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.add('hide'),2600)}

/* ====== الخطوات والفصول ====== */
const step=()=>CH[S.ch].steps[S.st];
function beginStep(){const s=step();$('obj').textContent=s.o;if(npc){scene.remove(npc);npc=null}
 mk.position.set(s.at[0],15,s.at[1]);
 if(s.n){npc=figure(s.n[1]);npc.position.set(s.at[0]+1.8,0,s.at[1]);npc.name=s.n[0];scene.add(npc)}}
function fx(f){if(f==='tire')S.en=Math.max(0,S.en-20);if(f==='rest'){S.en=Math.min(100,S.en+25);S.hp=Math.min(100,S.hp+10)}if(f==='dust')dust=10;if(f==='dmg'){S.hp=Math.max(10,S.hp-12);dust=8}}
function interact(){if(busy||!on)return;const s=step();if(Math.hypot(pl.position.x-s.at[0],pl.position.z-s.at[1])>4.5)return;
 dlg(s.d,()=>{if(s.give)for(const k in s.give)S.inv[k]=(S.inv[k]||0)+s.give[k];fx(s.fx);S.st++;
  if(S.st>=CH[S.ch].steps.length){S.ch++;S.st=0;if(S.ch>=CH.length)return finish();busy=true;$('fade').style.opacity=1;setTimeout(()=>load(false),1200)}else{beginStep();save()}})}
function load(resume){const c=CH[S.ch];scene.background=new T.Color(c.sky);fogBase=c.fg;scene.fog=new T.FogExp2(c.sky,c.fg);sun.intensity=c.sn;hemi.intensity=.35+.4*c.sn;
 const p=resume?[S.x,S.z]:c.sp;pl.position.set(p[0],0,p[1]);beginStep();$('hud').classList.remove('hide');
 if(!resume){busy=true;$('tt').textContent=c.t;$('ts').textContent=c.s;$('title').classList.remove('hide');$('fade').style.opacity=0;
  setTimeout(()=>{$('title').classList.add('hide');busy=false;save()},3200)}else{$('fade').style.opacity=0}}
function save(){S.x=pl.position.x;S.z=pl.position.z;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function finish(){on=false;busy=true;$('hud').classList.add('hide');try{localStorage.removeItem(KEY)}catch(e){}
 const t=S.sabr>=6?'ثابتٌ صابر':S.sabr>=2?'صبورٌ متماسك':'نفسٌ تعلّمت من الابتلاء',r=S.rel>=6?'وكنتَ سندًا لمن حولك كثيرًا.':'وكنتَ عونًا لمن حولك بقدر طاقتك.';
 $('end').innerHTML=`<h1>انتهت الرحلة</h1><p>يا ${S.name}: خرجتَ من هذه الأيام ${t}. ${r}</p><p>كانت هذه تجربة خيالية لشخصية خيالية داخل إطار تاريخي، ولا تغني عن قراءة السيرة في مصادرها.</p><b>المراجع التاريخية</b><ul>${REFS.map(x=>`<li>${x}</li>`).join('')}</ul><button id="again">العب من جديد</button>`;
 $('end').classList.remove('hide');$('fade').style.opacity=0;$('again').onclick=()=>location.reload()}

/* ====== المخزون ====== */
function inv(){const e=$('inv');if(!e.classList.contains('hide')){e.classList.add('hide');return}
 e.innerHTML='<b>المخزون</b>';const fn={تمر:()=>apply({en:15}),ماء:()=>{apply({en:20});S.sta=Math.min(100,S.sta+30)},ضماد:()=>apply({hp:25})};
 const ks=Object.keys(S.inv).filter(k=>S.inv[k]>0);if(!ks.length)e.innerHTML+='<div>فارغ</div>';
 ks.forEach(k=>{const d=document.createElement('div');d.innerHTML=`<span>${k} × ${S.inv[k]}</span>`;const b=document.createElement('button');b.textContent='استخدم';b.onclick=()=>{S.inv[k]--;fn[k]&&fn[k]();inv();inv()};d.appendChild(b);e.appendChild(d)});
 const c=document.createElement('button');c.textContent='إغلاق';c.onclick=()=>e.classList.add('hide');e.appendChild(c);e.classList.remove('hide')}

/* ====== التحديث ====== */
function update(dt,t){
 let mx=(keys.KeyD||keys.d?1:0)-(keys.KeyA?1:0)+joy.x,mz=(keys.KeyS?1:0)-(keys.KeyW?1:0)+joy.y;
 if(keys.ArrowLeft)yaw+=dt*1.8;if(keys.ArrowRight)yaw-=dt*1.8;if(busy)mx=mz=0;
 const l=Math.min(1,Math.hypot(mx,mz)),mv=l>.08,rn=(keys.ShiftLeft||keys.ShiftRight||run)&&S.sta>5&&mv,v=rn?7.5:4;
 if(mv){const n=Math.hypot(mx,mz),ax=mx/n,az=mz/n,wx=Math.cos(yaw)*ax+Math.sin(yaw)*az,wz=-Math.sin(yaw)*ax+Math.cos(yaw)*az;
  pl.position.x+=wx*v*l*dt;pl.position.z+=wz*v*l*dt;pl.rotation.y=Math.atan2(wx,wz);bob+=dt*(rn?13:8);
  pl.L.rotation.x=Math.sin(bob)*.7;pl.R.rotation.x=-Math.sin(bob)*.7;pl.position.y=Math.abs(Math.sin(bob))*.07}else{pl.L.rotation.x=pl.R.rotation.x=0;pl.position.y=0}
 cols.forEach(([cx,cz,r])=>{const dx=pl.position.x-cx,dz=pl.position.z-cz,d=Math.hypot(dx,dz);if(d<r&&d>0){pl.position.x=cx+dx/d*r;pl.position.z=cz+dz/d*r}});
 pl.position.x=Math.max(-85,Math.min(85,pl.position.x));pl.position.z=Math.max(-240,Math.min(45,pl.position.z));
 S.sta=rn?Math.max(0,S.sta-22*dt):Math.min(100,S.sta+10*dt);S.en=Math.max(0,S.en-.1*dt);
 if(S.en<=0)S.hp-=.4*dt;else if(S.hp<100&&S.en>40)S.hp=Math.min(100,S.hp+.3*dt);
 if(S.hp<=0){S.hp=40;S.en=40;toast('سقطتَ من الإعياء، ثم قمتَ بعد حين')}
 // الكاميرا والشمس
 const p=pl.position,cd=9,ch=5.5,ty=new T.Vector3(p.x+Math.sin(yaw)*cd,ch,p.z+Math.cos(yaw)*cd);cam.position.lerp(ty,.12);cam.lookAt(p.x,2,p.z);
 sun.position.set(p.x+30,50,p.z+20);sun.target.position.copy(p);
 // غبار وطقس
 dust=Math.max(0,dust-dt);scene.fog.density=fogBase+(dust>0?.014*Math.min(1,dust/2):0);
 const wd=2+Math.min(1,dust)*9,a=pts.geometry.attributes.position.array;
 for(let i=0;i<a.length;i+=3){a[i]+=wd*dt;a[i+1]+=Math.sin(t+i)*dt*.2;
  if(a[i]-p.x>25)a[i]-=50;if(a[i]-p.x<-25)a[i]+=50;if(a[i+2]-p.z>25)a[i+2]-=50;if(a[i+2]-p.z<-25)a[i+2]+=50;if(a[i+1]<0)a[i+1]=6;if(a[i+1]>8)a[i+1]=.5}
 pts.geometry.attributes.position.needsUpdate=true;pts.position.set(p.x,0,p.z);for(let i=0;i<a.length;i+=3){}
 pts.material.opacity=.12+.5*Math.min(1,dust/3);
 if(AU){AU.g.gain.value=.035+.03*Math.sin(t*.3)+Math.min(1,dust)*.05;AU.f.frequency.value=400+150*Math.sin(t*.17)}
 // تفاعل
 const s=step(),near=!busy&&Math.hypot(p.x-s.at[0],p.z-s.at[1])<4.5;$('prompt').classList.toggle('hide',!near);
 if(npc){npc.lookAt(p.x,npc.position.y,p.z)}mk.rotation.y=t;mk.material.opacity=.2+.12*Math.sin(t*2);
 // واجهة
 $('hp').style.width=S.hp+'%';$('en').style.width=S.en+'%';$('sta').style.width=S.sta+'%';mini(s)}
function mini(s){const c=$('mini').getContext('2d'),W=140,X=x=>(x+90)/180*W,Z=z=>(50-z)/310*W;c.fillStyle='#2a1e12';c.fillRect(0,0,W,W);
 c.fillStyle='#7a5a45';c.fillRect(0,0,W,Z(-225));c.fillStyle='#8a7050';c.fillRect(X(-52),Z(8),X(52)-X(-52),Z(-40)-Z(8));
 c.fillStyle='#d9c9a0';[[-12,-172],[12,-170],[28,-182],[-4,-182],[30,-170]].forEach(([x,z])=>c.fillRect(X(x)-2,Z(z)-2,4,4));
 c.fillStyle='#ffd070';c.beginPath();c.arc(X(s.at[0]),Z(s.at[1]),4,0,7);c.fill();
 c.fillStyle='#fff';c.save();c.translate(X(pl.position.x),Z(pl.position.z));c.rotate(-pl.rotation.y+Math.PI);c.beginPath();c.moveTo(0,-5);c.lineTo(4,4);c.lineTo(-4,4);c.fill();c.restore()}

function loop(){requestAnimationFrame(loop);const dt=Math.min(clk.getDelta(),.05);if(on)update(dt,clk.elapsedTime);ren.render(scene,cam)}

/* ====== التهيئة والمدخلات ====== */
function init(){
 ren=new T.WebGLRenderer({antialias:true});ren.setPixelRatio(Math.min(devicePixelRatio,2));ren.setSize(innerWidth,innerHeight);ren.shadowMap.enabled=true;$('game').appendChild(ren.domElement);
 scene=new T.Scene();scene.background=new T.Color(0xe6c88e);scene.fog=new T.FogExp2(0xe6c88e,.006);cam=new T.PerspectiveCamera(60,innerWidth/innerHeight,.1,700);cam.position.set(0,6,18);
 hemi=new T.HemisphereLight(0xfff2d8,0x8a6a40,.7);scene.add(hemi);
 sun=new T.DirectionalLight(0xfff0cc,1.1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const c=sun.shadow.camera;c.left=c.bottom=-40;c.right=c.top=40;c.far=160;scene.add(sun,sun.target);
 build();
 addEventListener('resize',()=>{ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});
 addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE')interact();if(e.code==='KeyI'&&on)inv()});addEventListener('keyup',e=>keys[e.code]=false);
 let dr=null;const g=$('game');g.addEventListener('pointerdown',e=>dr=e.clientX);addEventListener('pointerup',()=>dr=null);
 addEventListener('pointermove',e=>{if(dr!==null&&on){yaw-=(e.clientX-dr)*.006;dr=e.clientX}});
 const jy=$('joy'),kn=jy.firstElementChild,jm=e=>{const r=jy.getBoundingClientRect(),t=e.touches?e.touches[0]:e,dx=t.clientX-r.left-55,dy=t.clientY-r.top-55,d=Math.min(40,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);
  joy.x=Math.cos(a)*d/40;joy.y=Math.sin(a)*d/40;kn.style.transform=`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px)`;e.preventDefault()};
 jy.addEventListener('touchstart',jm,{passive:false});jy.addEventListener('touchmove',jm,{passive:false});
 jy.addEventListener('touchend',()=>{joy.x=joy.y=0;kn.style.transform=''});
 $('bAct').onclick=interact;$('bRun').onclick=e=>{run=!run;e.target.style.borderColor=run?'#d9a84e':''};$('bInv').onclick=inv;$('bSave').onclick=()=>{save();toast('تم حفظ التقدم')};
 document.querySelectorAll('.c').forEach(b=>b.onclick=()=>{document.querySelectorAll('.c').forEach(x=>x.classList.remove('on'));b.classList.add('on');sel=+b.dataset.i});
 let sv=null;try{sv=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(sv&&sv.name)$('cont').classList.remove('hide');
 $('go').onclick=()=>{S=NEW();S.name=$('nm').value.trim()||'هاني';S.col=COLS[sel];start(false)};
 $('cont').onclick=()=>{S=sv;start(true)};
 loop()}
function start(resume){$('menu').classList.add('hide');if(pl)scene.remove(pl);pl=figure(S.col);scene.add(pl);wind();on=true;busy=false;yaw=0;load(resume)}
init();
