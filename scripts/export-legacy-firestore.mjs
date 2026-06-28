// One-off migration helper: export the CURRENT live site's Firestore content
// (the `projects` collection + `settings/shop` doc) to JSON so it can be migrated
// into the new Payload/Postgres data model. Firestore rules allow public read on
// these, so no auth is needed — just the public web config.
//
// Run:  npm i firebase  &&  node scripts/export-legacy-firestore.mjs [outfile.json]
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { writeFileSync } from 'node:fs'

const firebaseConfig = {
  projectId: 'gen-lang-client-0797455311',
  appId: '1:314283347224:web:cde609c89af5025f3b226d',
  apiKey: 'AIzaSyChUtO6L7seQDQ9zB0vaceqW46Aagi_ED0',
  authDomain: 'gen-lang-client-0797455311.firebaseapp.com',
  storageBucket: 'gen-lang-client-0797455311.firebasestorage.app',
  messagingSenderId: '314283347224',
}
// The current site uses a non-default Firestore database id.
const DATABASE_ID = 'ai-studio-920d2e2f-43e3-4845-8e56-c8b19c6179e6'

const app = initializeApp(firebaseConfig)
const db = getFirestore(app, DATABASE_ID)

const out = { exportedAt: new Date().toISOString(), source: { projectId: firebaseConfig.projectId, databaseId: DATABASE_ID }, projects: [], settings: {} }

const projSnap = await getDocs(collection(db, 'projects'))
projSnap.forEach((d) => out.projects.push({ id: d.id, ...d.data() }))

const shopSnap = await getDoc(doc(db, 'settings', 'shop'))
out.settings.shop = shopSnap.exists() ? shopSnap.data() : null

const outfile = process.argv[2] || 'legacy-firestore.json'
writeFileSync(outfile, JSON.stringify(out, null, 2))
console.log(`Exported ${out.projects.length} projects; shop settings: ${out.settings.shop ? 'present' : 'missing'} -> ${outfile}`)
process.exit(0)
