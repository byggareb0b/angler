/* Castelo do Bode Angler: data and recommendation engine.
   Pure functions, no DOM. Loaded by index.html and testable in Node. */
(function (root) {
  'use strict';

  const LAKE = { lat: 39.62, lng: -8.27, tz: 'Europe/Lisbon' };

  // ---------- Spots ----------
  // type: rock (deep steep rock and points), arm (side arm / creek arm),
  // mouth (where a side arm meets the main channel), flat (beach, gentler shallows), points (peninsula)
  const SPOTS = [
    { id: 'pin', name: 'The Lake House', short: 'The Lake House', lat: 39.561806, lng: -8.301583, type: 'rock', crowd: false,
      access: 'Shore on points and coves; boat ramps near the dam',
      about: 'The deepest, clearest water in the lake, 2.5 km above the dam. Steep schist walls and rocky points drop straight into deep water.' },
    { id: 'aldeia', name: 'Aldeia do Mato', short: 'Aldeia do Mato', lat: 39.5454, lng: -8.2773, type: 'flat', crowd: true,
      access: 'River beach with parking and a café',
      about: 'Easiest bank access in the lower basin. Fish the rocky points either side of the swimming area, away from the pontoons.',
      maps: 'https://maps.google.com/?cid=1431775541073211570' },
    { id: 'bairradinha', name: 'Bairradinha', short: 'Bairradinha', lat: 39.6483, lng: -8.2417, type: 'mouth', crowd: true,
      access: 'Shore and boat, sand and rock',
      about: 'Sits where a long side arm joins the main channel. Baitfish funnel through the junction, especially in autumn.',
      maps: 'https://maps.google.com/?cid=1726704174555203436' },
    { id: 'lagoazul', name: 'Lago Azul / Castanheira', short: 'Lago Azul', lat: 39.6758, lng: -8.2308, type: 'rock', crowd: true,
      access: 'Shore, boat ramp',
      about: 'Steep main-channel banks. Local anglers name it as a bass spot from the bank. It is also the wakeboard area, so go early.',
      maps: 'https://maps.google.com/?cid=14198264683636825239' },
    { id: 'fernandaires', name: 'Fernandaires', short: 'Fernandaires', lat: 39.7347, lng: -8.2093, type: 'arm', crowd: true,
      access: 'Shore, parking',
      about: 'Up a side arm. Gentle shallows that drop off fast: bass hunt the edge, carp patrol the shallows.',
      maps: 'https://maps.google.com/?cid=8799688493583912083' },
    { id: 'dornes', name: 'Dornes', short: 'Dornes', lat: 39.7705, lng: -8.2690, type: 'points', crowd: false,
      access: 'Shore and boat',
      about: 'A peninsula with water on three sides. Points and drop-offs all round, so there is always a bank facing the wind.',
      maps: 'https://maps.google.com/?cid=14438525901812112062' }
  ];
  const SHOP = { name: 'Tomaraventura, Tomar', lat: 39.6049, lng: -8.4092, maps: 'https://maps.google.com/?cid=1484547640379811589',
    hours: 'Mon to Fri 9:00 to 13:00 and 15:00 to 19:00, Sat 9:00 to 13:00' };
  const DAM = { lat: 39.5428, lng: -8.3197, radius: 150 };

  const TYPE_LABEL = { rock: 'Deep rock and points', arm: 'Side arm', mouth: 'Arm mouth', flat: 'Beach and shallows', points: 'Peninsula points' };

  // ---------- Lures and baits ----------
  // retrieve: drag | hop | vertical | dead | steady | yoyo | jerk | walk
  const LURES = [
    { id: 'jig', name: 'Football jig', photo: 'lures/t-jig.webp', plate: 'lures/p-jig.webp', species: 'bass', retrieve: 'drag', mimic: 'crayfish', big: true,
      rig: '21 g (3/4 oz) head, 14 g where it snags. Craw trailer.',
      how: 'Drag it slowly down rocky points. Do not hop it: let it bump the bottom and kick up silt like a fleeing crayfish.',
      ref: { label: 'BassResource video', url: 'https://bassresource.com/bass-fishing-videos/football-jigs.html' } },
    { id: 'texas', name: 'Texas-rigged creature', photo: 'lures/t-texas.webp', plate: 'lures/p-texas.webp', species: 'bass', retrieve: 'hop', mimic: 'crayfish',
      rig: '7 g (1/4 oz) tungsten bullet weight, 3/0 wide-gap hook.',
      how: 'Short hops along ledges and broken rock. Watch the line as it sinks and strike on any jump.',
      ref: { label: 'BassResource video', url: 'https://bassresource.com/bass-fishing-videos/texas-rig-video.html' } },
    { id: 'dropshot', name: 'Drop shot', photo: 'lures/t-dropshot.webp', plate: 'lures/p-dropshot.webp', species: 'bass', retrieve: 'vertical', mimic: 'baitfish',
      rig: '7 g weight, size 2 hook, 6 lb fluorocarbon, 7 to 10 cm worm.',
      how: 'Cast at 45 degrees to a steep wall and step the bait down it, keeping it tight to the rock. Shake, do not move.',
      ref: { label: 'Wired2Fish', url: 'https://wired2fish.com/fishing-videos/how-to-catch-spotted-bass-drop-shot-rig-steep-walls' } },
    { id: 'ned', name: 'Ned rig', photo: 'lures/t-ned.webp', plate: 'lures/p-ned.webp', species: 'bass', retrieve: 'dead', mimic: 'crayfish',
      rig: '2 to 3.5 g mushroom head, braid to 8 to 10 lb fluoro leader.',
      how: 'Drag or hop very slowly with long pauses. The bait that still gets bites on calm, bright, pressured days.',
      ref: { label: 'BassResource', url: 'https://bassresource.com/fishing/ned-rig-guide.html' } },
    { id: 'spinner', name: 'Spinnerbait', photo: 'lures/t-spinner.webp', plate: 'lures/p-spinner.webp', species: 'bass', retrieve: 'steady', mimic: 'baitfish',
      rig: '14 to 21 g; go heavier in wind. Willow blades, slim shad trailer.',
      how: 'Long casts to wind-blown banks and creek mouths, then a steady retrieve. Bump it into rock.',
      ref: { label: 'Wired2Fish, Jacob Wheeler', url: 'https://www.wired2fish.com/fishing-videos/jacob-wheelers-guide-to-spinnerbait-fishing-in-the-wind' } },
    { id: 'lipless', name: 'Lipless crankbait', photo: 'lures/t-lipless.webp', plate: 'lures/p-lipless.webp', species: 'bass', retrieve: 'yoyo', mimic: 'baitfish',
      rig: '14 to 21 g rattling bait, bladed belly treble for flash.',
      how: 'Rip it up, let it flutter down, repeat. Covers water fast when bass are chasing baitfish in the arms.',
      ref: { label: 'Wired2Fish', url: 'https://www.wired2fish.com/fishing-videos/how-to-fish-a-lipless-crankbait-for-fall-bass' } },
    { id: 'crank', name: 'Squarebill crankbait', photo: 'lures/t-crank.webp', plate: 'lures/p-crank.webp', species: 'bass', retrieve: 'steady', mimic: 'baitfish',
      rig: 'Shallow diver, 1 to 2.5 m.',
      how: 'Crank it into rock and let it deflect. The bounce off cover is what triggers the strike.',
      ref: null },
    { id: 'jerk', name: 'Suspending jerkbait', photo: 'lures/t-jerk.webp', plate: 'lures/p-jerk.webp', species: 'bass', retrieve: 'jerk', mimic: 'baitfish',
      rig: '10 to 12 cm suspending (SP) minnow.',
      how: 'Jerk, jerk, pause. Pause about 3 s in 10 to 12 °C water and up to 10 s when it is colder. Slack line between twitches.',
      ref: { label: 'Wired2Fish', url: 'https://www.wired2fish.com/winter-fishing/8-coldwater-jerkbait-tips-you-may-be-overlooking/' } },
    { id: 'topwater', name: 'Topwater walker', photo: 'lures/t-topwater.webp', plate: 'lures/p-topwater.webp', species: 'bass', retrieve: 'walk', mimic: 'baitfish',
      rig: '10 to 12 cm walking bait or popper.',
      how: 'Rod tip down, twitch 30 to 45 cm and take up slack each time. Wait until you feel the weight before striking.',
      ref: { label: 'Tackle Warehouse', url: 'https://www.tacklewarehouse.com/bass-fishing/how-to/how-to-walk-a-topwater-for-bass-fishing.html' } },
    { id: 'swim', name: 'Swimbait', photo: 'lures/t-swim.webp', plate: 'lures/p-swim.webp', species: 'bass', retrieve: 'steady', mimic: 'baitfish', big: true,
      rig: '10 to 15 cm paddle tail on a weighted hook or jig head.',
      how: 'Slow roll it near baitfish and along points. Fewer bites, bigger fish.',
      ref: null },

    { id: 'tiger', name: 'Hair-rigged tiger nuts', photo: 'lures/t-tiger.webp', plate: 'lures/p-tiger.webp', species: 'carp', retrieve: 'static', mimic: 'bait',
      rig: 'Two nuts on a hair, 30 cm hooklength, 85 g lead.',
      how: 'Soak and boil before use. Tough enough that the crayfish cannot strip them, the main problem with soft baits here.',
      ref: null },
    { id: 'boilie', name: 'Hard boilie', photo: 'lures/t-boilie.webp', plate: 'lures/p-boilie.webp', species: 'carp', retrieve: 'static', mimic: 'bait',
      rig: '18 to 20 mm hardened boilie on a hair rig.',
      how: 'Fish over a small bed of the same boilies, ideally on a spot you have baited for 2 to 4 days.',
      ref: null },
    { id: 'particles', name: 'Maize over particles', photo: 'lures/t-particles.webp', plate: 'lures/p-particles.webp', species: 'carp', retrieve: 'static', mimic: 'bait',
      rig: 'Plastic or real maize on the hair over hemp and maize.',
      how: 'Lots of small food keeps carp grubbing in one place. Best when the water is warm and fish feed hard.',
      ref: null },
    { id: 'popup', name: 'Single bright pop-up', photo: 'lures/t-popup.webp', plate: 'lures/p-popup.webp', species: 'carp', retrieve: 'static', mimic: 'bait',
      rig: 'Yellow or pink 12 to 15 mm pop-up, no free bait.',
      how: 'In cold water carp eat little. One visible bait, recast often to find them rather than waiting on a baited spot.',
      ref: null },
    { id: 'surface', name: 'Floating bread or dog biscuit', photo: 'lures/t-surface.webp', plate: 'lures/p-surface.webp', species: 'carp', retrieve: 'static', mimic: 'bait',
      rig: 'Controller float, bread crust or a biscuit on a hair.',
      how: 'On hot, calm days carp cruise just under the surface. Feed a few mixers until they take confidently, then cast.',
      ref: null }
  ];

  // ---------- Conditions helpers ----------
  const WATER_EST = [11, 11, 13, 15, 18, 22, 25, 26, 24, 20, 16, 13]; // surface °C, estimate by month
  function waterEstimate(date) {
    const m = date.getUTCMonth(), d = date.getUTCDate();
    const a = WATER_EST[m], b = WATER_EST[(m + 1) % 12];
    return Math.round((a + (b - a) * (d / 31)) * 2) / 2;
  }

  // Sun times (sunrise equation). Returns Date objects.
  function sunTimes(date, lat, lng) {
    const rad = Math.PI / 180;
    const jd = date.getTime() / 86400000 + 2440587.5;
    const n = Math.round(jd - 2451545.0 + 0.0008 - 0.5 + 0.5); // day number near local noon
    const jstar = n - lng / 360;
    const M = (357.5291 + 0.98560028 * jstar) % 360;
    const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    const L = (M + C + 180 + 102.9372) % 360;
    const jt = 2451545 + jstar + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * L * rad);
    const decl = Math.asin(Math.sin(L * rad) * Math.sin(23.4397 * rad));
    const cosw = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(decl)) / (Math.cos(lat * rad) * Math.cos(decl));
    const w = Math.acos(Math.max(-1, Math.min(1, cosw))) / rad;
    const toDate = j => new Date((j - 2440587.5) * 86400000);
    return { rise: toDate(jt - w / 360), set: toDate(jt + w / 360), noon: toDate(jt) };
  }

  const SYNODIC = 29.530588853;
  const NEW_MOON_REF = Date.UTC(2000, 0, 6, 18, 14);
  function moon(date) {
    let age = ((date.getTime() - NEW_MOON_REF) / 86400000) % SYNODIC;
    if (age < 0) age += SYNODIC;
    const f = age / SYNODIC;
    const illum = (1 - Math.cos(2 * Math.PI * f)) / 2;
    let key, name;
    if (age < 1.85 || age > SYNODIC - 1.85) { key = 'new'; name = 'New moon'; }
    else if (age < 5.54) { key = 'waxing'; name = 'Waxing crescent'; }
    else if (age < 9.23) { key = 'quarter'; name = 'First quarter'; }
    else if (age < 12.92) { key = 'waxing'; name = 'Waxing gibbous'; }
    else if (age < 16.61) { key = 'full'; name = 'Full moon'; }
    else if (age < 20.30) { key = 'waning'; name = 'Waning gibbous'; }
    else if (age < 23.99) { key = 'quarter'; name = 'Last quarter'; }
    else { key = 'waning'; name = 'Waning crescent'; }
    return { age, f, illum, key, name };
  }

  // ---------- Legal and seasonal ----------
  function md(date) { return (date.getUTCMonth() + 1) * 100 + date.getUTCDate(); }
  function bassOpen(date) { const v = md(date); return !(v >= 316 && v <= 514); }
  function barbelOpen(date) { const v = md(date); return !(v >= 316 && v <= 614); }

  function bassPhase(date, waterT) {
    const m = date.getUTCMonth() + 1;
    if (!bassOpen(date)) return 'closed';
    if (waterT < 12) return 'winter';
    if (m >= 2 && m <= 3) return 'prespawn';
    if (m === 5 || m === 6) return 'postspawn';
    if (waterT >= 22) return 'summer';
    if (m >= 9 && m <= 12) return 'autumn';
    if (m >= 7 && m <= 8) return 'summer';
    return 'winter';
  }
  const PHASE_LABEL = { closed: 'Closed season', winter: 'Cold water', prespawn: 'Pre-spawn', postspawn: 'Post-spawn', summer: 'Summer', autumn: 'Autumn feed' };

  // light: night | dawn | morning | midday | afternoon | dusk
  function lightOf(t, sun) {
    const h = 3600000;
    if (t < sun.rise.getTime() - h / 2 || t > sun.set.getTime() + h / 2) return 'night';
    if (t <= sun.rise.getTime() + 1.5 * h) return 'dawn';
    if (t >= sun.set.getTime() - 1.5 * h) return 'dusk';
    const noon = sun.noon.getTime();
    if (Math.abs(t - noon) <= 2.5 * h) return 'midday';
    return t < noon ? 'morning' : 'afternoon';
  }
  const LIGHT_LABEL = { night: 'Night', dawn: 'Dawn', morning: 'Morning', midday: 'Midday', afternoon: 'Afternoon', dusk: 'Dusk' };

  function legalWindow(sun) {
    return { start: new Date(sun.rise.getTime() - 1800000), end: new Date(sun.set.getTime() + 1800000) };
  }

  // ---------- Weights ----------
  // Each entry: lure id -> points. Reason text is shown to the angler.
  const W = {
    phase: {
      winter:    { jerk: 3, jig: 2, dropshot: 2, ned: 2, texas: 1, lipless: 1, swim: 0, crank: -1, spinner: -1, topwater: -3 },
      prespawn:  { jerk: 3, jig: 3, swim: 2, lipless: 2, spinner: 1, texas: 1, dropshot: 1, ned: 1, crank: 1, topwater: -2 },
      postspawn: { topwater: 2, dropshot: 2, ned: 2, swim: 1, texas: 1, spinner: 1, jig: 1, crank: 1, jerk: 0, lipless: 0 },
      summer:    { dropshot: 3, jig: 2, texas: 2, topwater: 2, ned: 1, crank: 1, spinner: 0, swim: 0, lipless: 0, jerk: -1 },
      autumn:    { lipless: 3, spinner: 3, crank: 2, swim: 2, jig: 2, topwater: 1, jerk: 1, texas: 1, dropshot: 1, ned: 1 }
    },
    phaseWhy: {
      winter: 'Cold water: slow baits near the bottom', prespawn: 'Pre-spawn: big females feeding up',
      postspawn: 'Post-spawn: fish recovering, finesse and topwater', summer: 'Summer: fish go deep by day',
      autumn: 'Autumn: bass chase baitfish into the arms'
    },
    light: {
      dawn:      { topwater: 3, spinner: 1, swim: 1, crank: 1, jerk: 1, dropshot: -1 },
      dusk:      { topwater: 3, spinner: 1, swim: 1, crank: 1, jerk: 1, dropshot: -1 },
      morning:   { spinner: 0.5, crank: 0.5, jig: 0.5 },
      afternoon: { spinner: 0.5, crank: 0.5, jig: 0.5 },
      midday:    { dropshot: 2, jig: 1, ned: 1, texas: 1, topwater: -2, spinner: -0.5, crank: -0.5 }
    },
    lightWhy: { dawn: 'Low light at dawn', dusk: 'Low light at dusk', midday: 'Bright midday: fish sit deep and tight', morning: 'Morning', afternoon: 'Afternoon' },
    sky: {
      sun:   { dropshot: 1, ned: 1, jig: 1, texas: 1, topwater: -1, spinner: -1 },
      part:  {},
      cloud: { spinner: 2, crank: 1, swim: 1, topwater: 1, lipless: 1 },
      rain:  { spinner: 2, topwater: 1, crank: 1, lipless: 1 }
    },
    skyWhy: { sun: 'Bright sun: finesse and bottom baits', cloud: 'Overcast: bass roam and chase', rain: 'Rain breaks the surface: moving baits' },
    wind: {
      calm:   { ned: 1, dropshot: 1, topwater: 1, jerk: 1, spinner: -1 },
      breeze: { spinner: 1, lipless: 1, crank: 0.5 },
      windy:  { spinner: 3, lipless: 2, crank: 2, swim: 1, jerk: -1, ned: -2, dropshot: -1, topwater: -2 }
    },
    windWhy: { calm: 'Calm water: subtle baits', breeze: 'A breeze ruffles the surface', windy: 'Wind pushes baitfish onto banks' },
    pressure: {
      falling: { spinner: 1, lipless: 1, crank: 1, swim: 1, topwater: 1 },
      steady:  {},
      rising:  { ned: 2, dropshot: 2, jig: 1, spinner: -1, lipless: -1, crank: -1, topwater: -1 }
    },
    pressureWhy: { falling: 'Falling pressure: fish feed before the front', rising: 'Rising pressure after a front: tough bite, go finesse' },
    spot: {
      rock:   { jig: 2, dropshot: 2, texas: 1, jerk: 1, ned: 1, lipless: -1 },
      arm:    { spinner: 2, lipless: 2, crank: 2, swim: 1, topwater: 1, texas: 1 },
      mouth:  { spinner: 2, lipless: 1, crank: 1, swim: 2, jig: 1 },
      flat:   { topwater: 1, spinner: 1, ned: 1, lipless: 1, crank: 1, swim: 1, jig: -1, dropshot: -1 },
      points: { jig: 1, crank: 1, spinner: 1, jerk: 1, swim: 1, dropshot: 1 }
    },
    spotWhy: { rock: 'Steep rock suits bottom baits', arm: 'Side arms hold baitfish', mouth: 'Baitfish funnel through the mouth', flat: 'Shallows suit fast and surface baits', points: 'Points on every side' },

    carp: {
      temp: (t) => t < 10 ? { popup: 2, tiger: -0.5, boilie: -0.5, particles: -2, surface: -8 }
                : t < 15 ? { popup: 1, tiger: 1, boilie: 1, particles: -0.5, surface: -6 }
                : t < 24 ? { tiger: 2, boilie: 2, particles: 2, surface: 0 }
                : { tiger: 1, boilie: 1, particles: 1.5, surface: 2 },
      light: { dawn: { tiger: 2, boilie: 2, particles: 2, popup: 2, surface: 0 }, dusk: { tiger: 1.5, boilie: 1.5, particles: 1.5, popup: 1.5 },
        midday: { surface: 2, tiger: -1, boilie: -1, particles: -1, popup: -0.5 }, morning: { tiger: 0.5, boilie: 0.5 }, afternoon: {} },
      sky: { sun: { surface: 1 }, part: {}, cloud: { tiger: 0.5, boilie: 0.5, particles: 0.5, surface: -2 }, rain: { surface: -3, tiger: 0.5 } },
      wind: { calm: { surface: 2 }, breeze: { tiger: 1, boilie: 1, particles: 1, surface: -1 }, windy: { surface: -4, tiger: 0.5, boilie: 0.5 } },
      pressure: { falling: { tiger: 1, boilie: 1, particles: 1 }, steady: {}, rising: { popup: 1, tiger: -0.5, boilie: -0.5, particles: -1 } },
      spot: { flat: { tiger: 1.5, boilie: 1.5, particles: 1.5, surface: 1 }, arm: { tiger: 1.5, boilie: 1.5, particles: 1.5, surface: 1 },
        mouth: { tiger: 1, boilie: 1, particles: 1 }, rock: { tiger: -1, boilie: -1, particles: -1.5, surface: 0.5 }, points: { tiger: 0.5, boilie: 0.5 } }
    }
  };

  // Spot fit for the season, independent of lure
  function spotFit(spot, c) {
    const out = [];
    let v = 0;
    const add = (n, why) => { v += n; if (why) out.push({ n, why }); };
    if (c.species === 'bass') {
      const ph = c.phase, t = spot.type;
      if (ph === 'winter') { if (t === 'rock') add(2, 'Deep water holds bass in winter'); else if (t === 'flat' || t === 'arm') add(-1, 'Too shallow for cold water'); }
      if (ph === 'summer') { if (t === 'rock') add(1, 'Deep, cool water in summer'); if ((t === 'flat') && c.light !== 'dawn' && c.light !== 'dusk') add(-1, 'Shallows too warm by day'); }
      if (ph === 'autumn') { if (t === 'arm') add(2, 'Bass follow baitfish into side arms in autumn'); if (t === 'mouth') add(1.5, 'Arm mouths are autumn ambush points'); }
      if (ph === 'prespawn') { if (t === 'arm' || t === 'mouth' || t === 'points') add(1, 'Pre-spawn fish stage near shallow bays'); }
      if (ph === 'postspawn') { if (t === 'flat' || t === 'arm') add(1, 'Post-spawn fish linger near the shallows'); }
      if (c.wind === 'windy' && (t === 'points' || t === 'rock' || t === 'mouth')) add(1, 'Wind-blown points switch on');
    } else {
      const t = spot.type;
      if (c.waterT >= 24 && t === 'rock') add(0.5, 'Deeper water is cooler in high summer');
      if (c.waterT < 24 && (t === 'flat' || t === 'arm')) add(1, 'Carp patrol shallows that warm first');
      if (c.wind === 'breeze' && (t === 'flat' || t === 'arm' || t === 'mouth')) add(0.5, 'Fish the bank the wind blows onto');
    }
    const m = c.month;
    if (spot.crowd && m >= 6 && m <= 9 && (c.light === 'midday' || c.light === 'morning' || c.light === 'afternoon')) add(-1.5, 'Swimmers and boats in summer daytime');
    return { v, why: out };
  }

  // How active fish are overall, from season and time of day
  function activity(c) {
    const out = [];
    let v = 0;
    const add = (n, why) => { v += n; out.push({ n, why }); };
    const warm = c.waterT >= 20, cold = c.waterT < 13, low = c.light === 'dawn' || c.light === 'dusk';
    if (warm && c.light === 'midday') add(-2, 'Hot midday: the slowest bite of the day');
    else if (warm && low) add(1.5, 'Cool low light in warm weather: peak feeding');
    else if (!warm && !cold && low) add(1, 'Low light: fish move up to feed');
    if (cold && (c.light === 'midday' || c.light === 'afternoon')) add(1, 'Cold water: the warmest hours fish best');
    if (cold && c.light === 'dawn') add(-1, 'Cold dawn: fish are sluggish');
    return { v, why: out };
  }

  function scoreLure(lure, spot, c) {
    const parts = [];
    const add = (n, why, key) => { if (n) parts.push({ n, why, key }); };
    if (lure.species === 'bass') {
      add((W.phase[c.phase] || {})[lure.id] || 0, W.phaseWhy[c.phase], 'season');
      add((W.light[c.light] || {})[lure.id] || 0, W.lightWhy[c.light], 'light');
      if (c.light !== 'dawn' && c.light !== 'dusk') add((W.sky[c.sky] || {})[lure.id] || 0, W.skyWhy[c.sky], 'sky');
      add((W.wind[c.wind] || {})[lure.id] || 0, W.windWhy[c.wind], 'wind');
      add((W.pressure[c.pressure] || {})[lure.id] || 0, W.pressureWhy[c.pressure], 'pressure');
      if (spot) add((W.spot[spot.type] || {})[lure.id] || 0, W.spotWhy[spot.type], 'spot');
      // Topwater needs warm enough water
      if (lure.id === 'topwater' && c.waterT < 15) add(-2, 'Water too cold for surface baits', 'water');
      if (lure.id === 'jerk' && c.waterT >= 12 && c.waterT <= 16) add(1, 'Jerkbait water temperature', 'water');
      // Moon: small nudge only, evidence is weak
      if (lure.big && c.moon && (c.moon.key === 'full' || c.moon.key === 'new') && c.waterT >= 14 && c.waterT <= 19)
        add(0.5, (c.moon.key === 'full' ? 'Full' : 'New') + ' moon in cool water: a small edge for big fish', 'moon');
    } else {
      const C = W.carp;
      add(C.temp(c.waterT)[lure.id] || 0, c.waterT < 10 ? 'Cold water: carp eat little' : c.waterT < 15 ? 'Cool water: carp feeding slowly' : c.waterT < 24 ? 'Ideal water temperature for carp' : 'Warm water: carp near the surface', 'water');
      add((C.light[c.light] || {})[lure.id] || 0, c.light === 'dawn' ? 'Carp feed hardest at first light' : c.light === 'dusk' ? 'Evening feeding spell' : c.light === 'midday' ? 'Midday: carp bask and cruise' : '', 'light');
      add((C.sky[c.sky] || {})[lure.id] || 0, c.sky === 'cloud' ? 'Overcast keeps carp feeding longer' : c.sky === 'sun' ? 'Sun brings carp up' : 'Rain', 'sky');
      add((C.wind[c.wind] || {})[lure.id] || 0, c.wind === 'breeze' ? 'A warm breeze moves food and fish' : c.wind === 'calm' ? 'Calm surface' : 'Too rough for the surface', 'wind');
      add((C.pressure[c.pressure] || {})[lure.id] || 0, c.pressure === 'falling' ? 'Falling pressure: carp feed' : 'Rising pressure: fussy fish', 'pressure');
      if (spot) add((C.spot[spot.type] || {})[lure.id] || 0, spot.type === 'rock' ? 'Steep rock: few feeding areas' : 'Feeding shallows nearby', 'spot');
    }
    const sum = parts.reduce((a, p) => a + p.n, 0);
    const score = Math.max(0, Math.min(100, Math.round(30 + sum * 5)));
    return { lure, score, parts };
  }

  function colourTip(lure, c) {
    if (lure.species !== 'bass') return null;
    const low = c.light === 'dawn' || c.light === 'dusk';
    const bright = (c.sky === 'sun' || c.sky === 'part') && c.wind === 'calm';
    if (lure.mimic === 'crayfish') return low ? 'Black and blue, or dark green pumpkin' : bright ? 'Green pumpkin, brown, a touch of orange' : 'Brown and orange crayfish tones';
    if (lure.id === 'topwater') return low ? 'Bone or black for a clear silhouette' : 'Ghost shad or clear';
    if (bright) return 'Natural and translucent: ghost shad, silver';
    if (low) return 'White, or a dark silhouette';
    return 'White and chartreuse, or bright shad';
  }

  function legal(c, t) {
    if (c.light === 'night') return { ok: false, why: 'Outside fishing hours (30 min before sunrise to 30 min after sunset)' };
    if (c.species === 'bass' && c.phase === 'closed') return { ok: false, why: 'Black bass season is closed from 16 March to 14 May' };
    return { ok: true };
  }

  function evaluate(spot, c) {
    const lg = legal(c);
    const lures = LURES.filter(l => l.species === c.species).map(l => scoreLure(l, spot, c)).sort((a, b) => b.score - a.score);
    const fit = spotFit(spot, c);
    const top = lures[0];
    const act = activity(c);
    const raw = top.score + (fit.v + act.v) * 7;
    const rating = !lg.ok ? 0 : raw < 45 ? 1 : raw < 58 ? 2 : raw < 70 ? 3 : raw < 82 ? 4 : 5;
    return { spot, lures, fit, act, rating, raw, legal: lg };
  }

  function conditionsAt(date, input) {
    // input: {species, sky, wind, pressure, waterT?, moonOverride?}
    const sun = sunTimes(date, LAKE.lat, LAKE.lng);
    const light = lightOf(date.getTime(), sun);
    const waterT = input.waterT != null ? input.waterT : waterEstimate(date);
    const mo = input.moonOverride || moon(date);
    const c = { species: input.species, sky: input.sky, wind: input.wind, pressure: input.pressure, waterT, moon: mo, light, sun, month: date.getUTCMonth() + 1 };
    c.phase = bassPhase(date, waterT);
    return c;
  }

  const api = { LAKE, SPOTS, SHOP, DAM, TYPE_LABEL, LURES, W, PHASE_LABEL, LIGHT_LABEL, WATER_EST,
    waterEstimate, sunTimes, moon, activity, bassOpen, barbelOpen, bassPhase, lightOf, legalWindow, spotFit, scoreLure, colourTip, evaluate, conditionsAt };
  root.CDB = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
