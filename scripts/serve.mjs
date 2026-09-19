import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{
 try {
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let target=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
  if (!target.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
  if (!['assets','categorias','productos'].some(d=>target.startsWith(path.join(root,d)+path.sep)) && !['index.html','404.html','robots.txt','sitemap.xml'].includes(path.relative(root,target))) {res.writeHead(404).end();return;}
  const content=await readFile(target);
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'}).end(content);
 } catch {res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}).end(await readFile('404.html'));}
}).listen(4173,'127.0.0.1',()=>console.log('FOX GAMER: http://127.0.0.1:4173'));
