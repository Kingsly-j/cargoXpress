import sharp from 'sharp';
import { mkdir, rename, access } from 'node:fs/promises';

await mkdir('assets/brand',{recursive:true});
const source='assets/brand/shipwave-logo-source.jpeg';
try { await access('public/shipwave-logo-source.jpeg'); await rename('public/shipwave-logo-source.jpeg',source); } catch { /* Use the preserved source on later runs. */ }
const {data,info}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
const rgba=Buffer.alloc(info.width*info.height*4);
let left=info.width,top=info.height,right=0,bottom=0;
for(let i=0;i<data.length;i+=3) {
  const r=data[i],g=data[i+1],b=data[i+2];
  const chroma=Math.max(r,g,b)-Math.min(r,g,b);
  const gray=(r+g+b)/3;
  const alpha=chroma<20&&gray>95&&gray<218 ? Math.max(0,Math.min(255,Math.round((gray-183)*255/32))) : 255;
  const p=(i/3)*4;
  rgba[p]=r;rgba[p+1]=g;rgba[p+2]=b;rgba[p+3]=alpha;
  const x=(i/3)%info.width,y=Math.floor((i/3)/info.width);
  if(alpha>28){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
}
// The uploaded artwork occupies this centered rectangle; excluding the large
// checkerboard margins keeps the stacked original logo legible in the header.
left=255;top=102;right=1024;bottom=611;
await sharp(rgba,{raw:{width:info.width,height:info.height,channels:4}})
  .extract({left,top,width:right-left+1,height:bottom-top+1})
  .png({compressionLevel:9,palette:false})
  .toFile('public/shipwave-logo.png');
await sharp(rgba,{raw:{width:info.width,height:info.height,channels:4}})
  .extract({left:350,top:102,width:330,height:330})
  .png({compressionLevel:9,palette:false})
  .toFile('public/shipwave-mark.png');
console.log(`Created transparent Shipwave logo (${right-left+1}x${bottom-top+1}).`);
