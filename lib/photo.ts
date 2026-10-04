import 'server-only'
import sharp from 'sharp'
import { createHash } from 'node:crypto'

export async function preparePhoto(file:File) {
 if(!file.size||file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Use a JPEG, PNG or WebP photo under 5 MB.')
 const original=Buffer.from(await file.arrayBuffer())
 const image=sharp(original,{limitInputPixels:25000000,failOn:'error'})
 const metadata=await image.metadata()
 if(!['jpeg','png','webp'].includes(metadata.format||'')||!metadata.width||!metadata.height||metadata.width<100||metadata.height<100||(metadata.pages||1)>1)throw Error('Use a single, readable photo at least 100 × 100 pixels.')
 // Re-encoding strips GPS/EXIF metadata; rotate first to respect orientation.
 const bytes=await image.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).jpeg({quality:85}).toBuffer()
 return {bytes,hash:createHash('sha256').update(bytes).digest('hex')}
}
