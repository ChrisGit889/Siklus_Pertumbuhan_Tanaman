const PLANTS = {
    monstera: { waterDays: {seedling:4, vegetative:5, flowering:6} },
    succulent: { waterDays: {seedling:7, vegetative:10, flowering:12} },
    basil: { waterDays: {seedling:2, vegetative:3, flowering:3} }
  };
  
  function lightScore(orientation, distanceM, obstruction){
    const base = {South:1.0, East:0.8, West:0.7, North:0.5}[orientation] || 0.6;
    const distFactor = Math.max(0.2, 1 - 0.25*distanceM);
    const obs = {none:1, sheer:0.8, wall:0.6}[obstruction] || 0.7;
    return Math.round(base * distFactor * obs * 100);
  }
  
  function waterIntervalDays(plantKey, phase, potDiamCm, tempC){
    const base = PLANTS[plantKey].waterDays[phase];
    const potAdj  = potDiamCm < 12 ? -1 : potDiamCm > 25 ? +1 : 0;
    const tempAdj = tempC > 30 ? -1 : tempC < 20 ? +1 : 0;
    return Math.max(1, base + potAdj + tempAdj);
  }
  
  function hitungRekomendasi(){
    const plant = document.getElementById("plant").value;
    const phase = document.getElementById("phase").value;
    const orientation = document.getElementById("orientation").value;
    const distance = parseFloat(document.getElementById("distance").value);
    const obstruction = document.getElementById("obstruction").value;
    const pot = parseInt(document.getElementById("pot").value);
    const temp = parseInt(document.getElementById("temp").value);
  
    const light = lightScore(orientation, distance, obstruction);
    const interval = waterIntervalDays(plant, phase, pot, temp);
  
    const res = `
      <h3>Hasil Rekomendasi:</h3>
      <p><b>Skor Cahaya:</b> ${light}/100</p>
      <p><b>Interval Siram:</b> setiap ${interval} hari</p>
      <p><b>Saran:</b> Tempatkan tanaman di jendela arah ${orientation}, ${distance} m dari kaca dengan kondisi ${obstruction}.</p>
    `;
    document.getElementById("result").innerHTML = res;
  
    buatKalender(interval);
  }
  
  function buatKalender(interval){
    const cal = document.getElementById("calendar");
    cal.innerHTML = "";
    for (let i=1; i<=30; i++){
      const day = document.createElement("div");
      day.className = "day";
      day.textContent = "Hari " + i;
      if (i % interval === 1) {
        day.classList.add("siram");
        day.textContent += "\n💧 Siram";
      }
      day.onclick = () => day.classList.toggle("done");
      cal.appendChild(day);
    }
  }
  