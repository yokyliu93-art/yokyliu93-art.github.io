import {loadEnvFile} from 'node:process';
import {fileURLToPath} from 'node:url';
// Server credentials stay outside Vite's client environment and the repository.
try{loadEnvFile(fileURLToPath(new URL('../.env',import.meta.url)));}catch(error){if(error.code!=='ENOENT')throw error;}
