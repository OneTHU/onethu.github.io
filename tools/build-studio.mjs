import {build} from 'esbuild';
await build({entryPoints:['src/studio.js'],outfile:'assets/studio.js',bundle:true,minify:true,format:'esm',target:['es2022'],legalComments:'external',metafile:true}).then(async result=>{const {writeFileSync}=await import('node:fs');writeFileSync('assets/studio-meta.json',JSON.stringify({bytes:result.metafile.outputs['assets/studio.js'].bytes,dependencies:['three@0.186.1'],license:'MIT; see studio.js.LEGAL.txt'},null,2)+'\n');});

const {copyFileSync}=await import('node:fs');copyFileSync('node_modules/three/LICENSE','assets/THREE-LICENSE.txt');
