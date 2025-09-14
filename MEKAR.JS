'use strict';

const PLANTS = {
  sunflower: { name: 'Bunga Matahari', waterBase: 3, fertilizerBase: 14, stages: { kecambah: 14, menanam: 7, remaja: 45, dewasa: 80 } },
  rose: { name: 'Mawar', waterBase: 4, fertilizerBase: 10, stages: { kecambah: 30, menanam: 10, remaja: 90, dewasa: 120 } },
  petunia: { name: 'Petunia', waterBase: 2, fertilizerBase: 10, stages: { kecambah: 7, menanam: 14, remaja: 35, dewasa: 70 } },
  strawberry: { name: 'Strawberry', waterBase: 3, fertilizerBase: 21, stages: { kecambah: 14, menanam: 30, remaja: 90, dewasa: 120 } },
  tomato: { name: 'Tomat', waterBase: 3, fertilizerBase: 14, stages: { kecambah: 7, menanam: 21, remaja: 60, dewasa: 100 } }
};

let currentPlant = "sunflower";

function show(id) {
  document.querySelectorAll('#beranda, #kalkulator, #detail').forEach(s => {
    if (s) s.style.display = 'none';
  });
  const target = document.getElementById(id);
  if (target) target.style.display = 'block';

  document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + id);
  if (navBtn) navBtn.classList.add('active');

  if (id === "detail") {
    showDetailContent(currentPlant);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDetailContent(plantKey) {
  document.querySelectorAll('.detail-section').forEach(section => {
    section.style.display = 'none';
  });
  const target = document.getElementById('detail-' + plantKey);
  if (target) {
    target.style.display = 'block';
  }

  document.querySelectorAll(".detail-tab").forEach(btn => btn.classList.remove("active"));
  const activeBtn = Array.from(document.querySelectorAll(".detail-tab")).find(btn => btn.onclick.toString().includes(plantKey));
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

function toggleTheme() {
  const body = document.body;
  const cur = body.getAttribute('data-theme') || 'light';
  const newTheme = cur === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', newTheme);
  document.getElementById('themeSwitch')?.classList.toggle('on', newTheme === 'dark');
  localStorage.setItem('mekar-theme', newTheme);
}

function lightScore(orientation, distance, obstruction) {
  const baseMap = { south: 1.0, east: 0.85, west: 0.8, north: 0.55 };
  const base = baseMap[orientation] ?? 0.7;
  const distFactor = Math.max(0.4, 1 - 0.1 * (Number(distance) || 0));
  const obsMap = { none: 1, sheer: 0.85, block: 0.6 };
  const obs = obsMap[obstruction] ?? 0.8;
  return Math.round(base * distFactor * obs * 100);
}

function waterInterval(plantKey, tempC, potCm) {
  const p = PLANTS[plantKey] ?? { waterBase: 3 };
  let interval = p.waterBase;
  interval += (25 - tempC) / 10;
  interval += (15 - potCm) / 15;
  return Math.max(1, Math.round(interval));
}

function fertilizerFreq(plantKey) {
  return PLANTS[plantKey]?.fertilizerBase ?? 14;
}

function mediaAdvice(media) {
  const map = {
    mix: 'Media campuran umumnya baik untuk sebagian besar tanaman — drainase dan aerasi seimbang.',
    peat: 'Media gambut menyimpan air baik untuk tanaman yang suka kelembapan, tambahkan pasir untuk drainase jika perlu.',
    sandy: 'Media berpasir cepat menyerap dan mengalirkan air — cocok untuk tanaman yang tidak suka tergenang.',
    clay: 'Tanah liat menahan air lama; gunakan campuran untuk memperbaiki drainase.'
  };
  return map[media] || '';
}

function kpiEl(title, value) {
  const d = document.createElement('div');
  d.className = 'item';
  d.innerHTML = `<div style="font-size:13px;color:var(--muted)">${title}</div>
                 <div style="font-weight:800;margin-top:6px">${value}</div>`;
  return d;
}

function hitungRekomendasi() {
  const distance = parseFloat(document.getElementById('distance').value);
  const pot = parseInt(document.getElementById('pot').value);
  const temp = parseInt(document.getElementById('temp').value);

  if (isNaN(distance) || distance < 0 || isNaN(pot) || pot <= 0 || isNaN(temp)) {
    alert("Mohon masukkan nilai yang valid untuk Jarak, Diameter Pot, dan Suhu.");
    return;
  }

  const plant = document.getElementById('plant').value;
  currentPlant = plant;
  const orientation = document.getElementById('orientation').value;
  const obstruction = document.getElementById('obstruction').value;
  const media = document.getElementById('media').value;

  const ls = lightScore(orientation, distance, obstruction);
  const water = waterInterval(plant, temp, pot);
  const fert = fertilizerFreq(plant);

  const kpis = document.getElementById('kpis');
  kpis.innerHTML = '';
  kpis.appendChild(kpiEl('Skor Cahaya', `${ls}/100`));
  kpis.appendChild(kpiEl('Interval Siram', `Setiap ${water} hari`));
  kpis.appendChild(kpiEl('Frekuensi Pupuk', `Setiap ${fert} hari`));
  kpis.appendChild(kpiEl('Suhu Ideal', `~ ${Math.max(15, Math.min(30, temp))} °C`));

  const advice = document.getElementById('advice');
  advice.innerHTML = `<p><b>Rekomendasi singkat:</b> Tempatkan di arah ${orientation.toUpperCase()} sekitar ${distance} m dari jendela. ${mediaAdvice(media)}</p>`;

  const stagesEl = document.getElementById('stages');
  stagesEl.innerHTML = '';
  const dataStages = PLANTS[plant].stages;
  const keys = ['menanam', 'kecambah', 'remaja', 'dewasa'];
  const estimates = {};
  keys.forEach(k => {
    estimates[k] = dataStages[k];
  });

  keys.forEach(k => {
    const el = document.createElement('div');
    el.className = 'stage-pill';
    el.textContent = `${k} — hari ke ${estimates[k]}`;
    stagesEl.appendChild(el);
  });

  buatKalender(120, water, estimates);
}

function buatKalender(days, interval, estimates) {
  const cal = document.getElementById('calendar');
  cal.innerHTML = '';

  days = Math.max(1, Math.min(365, parseInt(days) || 120));
  interval = Math.max(1, parseInt(interval) || 3);

  for (let i = 1; i <= days; i++) {
    const day = document.createElement('div');
    day.className = 'day';
    day.tabIndex = 0;
    day.setAttribute('role', 'button');
    day.setAttribute('aria-pressed', 'false');

    const label = document.createElement('div');
    label.style.fontSize = '12px';
    label.style.color = 'var(--muted)';
    label.textContent = `Hari ${i}`;
    day.appendChild(label);

    const isWaterDay = i % interval === 0;
    const isStageDay = Object.values(estimates).some(stageDay => Number(stageDay) === i);

    if (isWaterDay) {
      day.classList.add('water');
      const w = document.createElement('div');
      w.textContent = '💧 Siram';
      w.style.marginTop = '6px';
      day.appendChild(w);
    }

    if (isStageDay) {
      day.classList.add('stage');
      const st = document.createElement('div');
      st.textContent = '⭐ ' + Object.keys(estimates).find(k => Number(estimates[k]) === i);
      st.style.marginTop = '6px';
      day.appendChild(st);
    }

    const toggleDone = () => {
      day.classList.toggle('done');
      const pressed = day.classList.contains('done');
      day.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    };
    day.addEventListener('click', toggleDone);
    day.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDone();
      }
    });

    cal.appendChild(day);
  }
}

function resetAll() {
  document.getElementById('plant').value = 'sunflower';
  document.getElementById('phase').value = 'seed';
  document.getElementById('orientation').value = 'south';
  document.getElementById('distance').value = 1;
  document.getElementById('obstruction').value = 'none';
  document.getElementById('pot').value = 15;
  document.getElementById('temp').value = 25;
  document.getElementById('media').value = 'mix';
  document.getElementById('kpis').innerHTML = '';
  document.getElementById('advice').innerHTML = '';
  document.getElementById('stages').innerHTML = '';
  document.getElementById('calendar').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
  show('beranda');

  const saved = localStorage.getItem('mekar-theme');
  if (saved) {
    document.body.setAttribute('data-theme', saved);
    if (saved === 'dark') {
      document.getElementById('themeSwitch')?.classList.add('on');
    }
  }

  const themeSwitch = document.getElementById('themeSwitch');
  if (themeSwitch) {
    themeSwitch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }
});