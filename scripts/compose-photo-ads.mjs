import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.resolve('output/service-ads');
const bg = await fs.readFile(path.join(dir,'photo-background.png'));
const logo = await fs.readFile(path.resolve('public/images/logo-vorzix.png'));
const b64 = b => b.toString('base64');
const e = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const ads = {
  fr:{k:'AGENCE TECHNOLOGIQUE',h:['Votre projet,','notre précision.'],body:['Sites web, boutiques et applications','sur mesure. Une équipe à vos côtés','du brief au lancement.'],tags:['SITE VITRINE','E-COMMERCE','RÉSERVATION','APPLICATION WEB'],cta:'DÉMARREZ VOTRE PROJET',foot:'Écrivez-nous sur Instagram · @vorzix.dev'},
  en:{k:'TECHNOLOGY STUDIO',h:['Your project,','our precision.'],body:['Custom websites, online stores and apps.','A dedicated team by your side','from brief to launch.'],tags:['SHOWCASE SITE','E-COMMERCE','BOOKING','WEB APPLICATION'],cta:'LET’S START YOUR PROJECT',foot:'Message us on Instagram · @vorzix.dev'},
  ar:{k:'وكالة تقنية',h:['مشروعك،','بدقّتنا.'],body:['مواقع ومتاجر وتطبيقات حسب الطلب.','فريق يرافقك من تحديد الفكرة','حتى إطلاق مشروعك.'],tags:['موقع تعريفي','متجر إلكتروني','موقع حجز','تطبيق ويب'],cta:'ابدأ مشروعك معنا',foot:'راسلنا على إنستغرام  @vorzix.dev'}
};

async function makeBase(lang) {
const suffix = lang === 'fr' ? '' : `-${lang}`;
const desktop = await sharp(path.join(dir,`site-desktop${suffix}.png`)).extract({left:240,top:250,width:800,height:440}).jpeg().toBuffer();
const offers = await sharp(path.join(dir,`site-offers${suffix}.png`)).extract({left:370,top:180,width:540,height:530}).jpeg().toBuffer();
const screens = `<svg xmlns="http://www.w3.org/2000/svg" width="1122" height="1402" viewBox="0 0 1122 1402">
 <defs>
  <clipPath id="l"><path d="M561 382 L1005 314 L972 713 L519 714 Z"/></clipPath>
  <clipPath id="p"><path d="M951 454 L1085 442 L1063 767 L931 767 Z"/></clipPath>
 </defs>
 <g clip-path="url(#l)"><image href="data:image/jpeg;base64,${b64(desktop)}" x="0" y="0" width="800" height="440" preserveAspectRatio="none" transform="matrix(.555,-.085,-.095,.752,561,382)"/></g>
 <g clip-path="url(#p)"><image href="data:image/jpeg;base64,${b64(offers)}" x="0" y="0" width="540" height="530" preserveAspectRatio="none" transform="matrix(.248,-.022,-.036,.591,950,454)"/></g>
 </svg>`;
return await sharp(bg).composite([{input:Buffer.from(screens)}]).png().toBuffer();
}

function overlay(d,rtl) {
 const x=rtl?520:75, a=rtl?'end':'start', f=rtl?'Arial, sans-serif':'Georgia, serif';
 const heading=d.h.map((s,i)=>`<text x="${x}" y="${315+i*73}" text-anchor="${a}" font-family="${f}" font-size="${rtl?59:61}" font-weight="${rtl?700:500}" fill="${i?'#D4AF7A':'#F4F1E8'}">${e(s)}</text>`).join('');
 const body=d.body.map((s,i)=>`<text x="${x}" y="${474+i*34}" text-anchor="${a}" font-family="Arial, sans-serif" font-size="${rtl?23:22}" fill="#F4F1E8">${e(s)}</text>`).join('');
 const tag=d.tags.map((s,i)=>{let bx=75+(i%2)*495,by=887+Math.floor(i/2)*83;return `<rect x="${bx}" y="${by}" width="477" height="68" rx="10" fill="#070A12" fill-opacity=".91" stroke="#C9A96A" stroke-opacity=".62"/><text x="${bx+238}" y="${by+43}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${rtl?22:20}" font-weight="600" fill="#F4F1E8">${e(s)}</text>`}).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1122" height="1402" viewBox="0 0 1122 1402">
 <defs><linearGradient id="shade"><stop stop-color="#05070B" stop-opacity=".7"/><stop offset=".55" stop-color="#05070B" stop-opacity=".15"/><stop offset="1" stop-color="#05070B" stop-opacity="0"/></linearGradient><linearGradient id="bottom" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#05070B" stop-opacity="0"/><stop offset=".35" stop-color="#05070B" stop-opacity=".55"/><stop offset="1" stop-color="#05070B" stop-opacity=".9"/></linearGradient></defs>
 <rect x="0" y="0" width="620" height="680" fill="url(#shade)"/><rect x="0" y="810" width="1122" height="592" fill="url(#bottom)"/>
 <image href="data:image/png;base64,${b64(logo)}" x="75" y="63" width="80" height="80"/>
 <text x="170" y="125" font-family="Arial, sans-serif" font-size="52" font-weight="700" letter-spacing="8" fill="#F4F1E8">VORZIX</text>
 <text x="${x}" y="235" text-anchor="${a}" font-family="Arial, sans-serif" font-size="${rtl?27:22}" letter-spacing="${rtl?0:3}" fill="#C9A96A">${e(d.k)}</text>
 ${heading}${body}
 <path d="M75 852h972" stroke="#C9A96A" stroke-opacity=".75"/>${tag}
 <rect x="177" y="1088" width="768" height="89" rx="45" fill="#C9A96A"/><text x="561" y="1144" text-anchor="middle" font-family="Arial, sans-serif" font-size="${rtl?31:27}" font-weight="700" fill="#070A12">${e(d.cta)}</text>
 <text x="561" y="1244" text-anchor="middle" font-family="Arial, sans-serif" font-size="${rtl?24:23}" fill="#F4F1E8">${e(d.foot)}</text>
 <text x="561" y="1315" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" letter-spacing="5" fill="#C9A96A">VORZIX.COM</text>
 </svg>`;
}
for (const [lang,d] of Object.entries(ads)) {
 const base = await makeBase(lang);
 const composed = await sharp(base).composite([{input:Buffer.from(overlay(d,lang==='ar'))}]).png().toBuffer();
 const final = await sharp(composed).resize(1080,1350).png().toBuffer();
 await fs.writeFile(path.join(dir,`vorzix-photo-instagram-corrected-${lang}.png`),final);
}
console.log('Created 3 photographic Instagram ads with real site captures');



