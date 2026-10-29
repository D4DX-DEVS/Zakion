// fetch elementor lazy webpack chunks + common libs that scripts load at runtime
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const ORIGIN = 'https://wordpress-1683093-6757014.cloudwaysapps.com';
const rt = fs.readFileSync(ROOT + '/public/wp/content/plugins/elementor/assets/js/webpack.runtime.min.js', 'utf8');
const urls = new Set();
const hashes = {}; for (const m of rt.matchAll(/"([\w.-]+\.bundle\.min\.js)"/g)) { urls.add('/wp-content/plugins/elementor/assets/js/' + m[1]); hashes[m[1]] = 1; }
const libs = ['lib/waypoints/waypoints.min.js', 'lib/share-link/share-link.min.js', 'lib/dialog/dialog.min.js', 'lib/swiper/v8/swiper.min.js', 'lib/animations/animations.min.css', 'lib/animations/styles/fadeInUp.min.css', 'lib/animations/styles/fadeIn.min.css', 'lib/animations/styles/fadeInLeft.min.css', 'lib/animations/styles/fadeInRight.min.css', 'lib/animations/styles/fadeInDown.min.css', 'lib/animations/styles/zoomIn.min.css', 'lib/animations/styles/slideInUp.min.css', 'lib/animations/styles/slideInLeft.min.css', 'lib/animations/styles/slideInRight.min.css', 'lib/eicons/css/elementor-icons.min.css'];
for (const l of libs) urls.add('/wp-content/plugins/elementor/assets/' + l);
console.log('chunks', Object.keys(hashes).length, 'total', urls.size);
let ok = 0;
for (const u of urls) {
  const r = await fetch(ORIGIN + u);
  if (!r.ok) { if (!/lib\//.test(u)) console.log('404', u); continue; }
  const dest = ROOT + '/public' + u.replace('/wp-content/', '/wp/content/');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer())); ok++;
}
console.log('saved', ok);
