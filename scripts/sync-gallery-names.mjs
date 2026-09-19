import {readFile,writeFile} from 'node:fs/promises';
const path='data/store.json',store=JSON.parse(await readFile(path,'utf8'));
const names={
 'IMG_2452.JPG':'PlayStation 5 Fat 825GB','IMG_2508.JPG':'PlayStation 5 Digital','IMG_2510.JPG':'Xbox Serie X Disco','IMG_2448.JPG':'Xbox Serie S','IMG_2450.JPG':'Nintendo Switch','IMG_6489.JPG':'Nintendo Switch','IMG_2513.JPG':'PlayStation 4','IMG_2519.JPG':'PlayStation 4',
 'IMG_2369.JPG':'Controles Ps5','IMG_2373.JPG':'Controles Ps5','IMG_2293.JPG':'Diademas','IMG_2291.JPG':'Diademas','IMG_2288.JPG':'PlayStation Portal','IMG_2459.JPG':'Volantes gaming','IMG_2295.JPG':'Accesorios gaming','IMG_2460.JPG':'G29',
 'IMG_6192.JPG':'EA Sports FC 25 · PS5','IMG_6193.JPG':'Black Myth: Wukong · PS5','IMG_6194.JPG':'Ghost of Tsushima · PS5','IMG_6195.JPG':'The Crew Motorfest · PS5','IMG_6196.JPG':'Metal Gear Solid Delta · PS5','IMG_6197.JPG':'Resident Evil 3 · PS5','IMG_6198.JPG':'Resident Evil 4 · PS5','IMG_6199.JPG':'Elden Ring · PS5','IMG_6200.JPG':'The Last of Us Part I · PS5','IMG_6201.JPG':'The Last of Us Part II · PS5','IMG_6202.JPG':'Uncharted · PS5','IMG_6203.JPG':'Marvel’s Spider-Man 2 · PS5','IMG_6204.JPG':'Grand Theft Auto V · PS5','IMG_6205.JPG':'EA Sports UFC 5 · PS5','IMG_6206.JPG':'Mafia · PS5','IMG_6207.JPG':'Call of Duty Black Ops 7 · PS5','IMG_6208.JPG':'Dragon Ball Sparking! ZERO · PS5','IMG_6209.JPG':'Silent Hill f · PS5','IMG_6210.JPG':'Little Nightmares III · PS5'
};
for(const p of store.gallery||[]) if(names[p.source])p.title=names[p.source];
await writeFile(path,JSON.stringify(store,null,2)+'\n');console.log('Gallery names synchronized.');
