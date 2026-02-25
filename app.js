const reasons = [
    ['🌊', 'Your laugh', 'Even through static, your laugh changes my entire day.'],
    ['🫶', 'Your support', 'You stand with me from any time zone.'],
    ['📞', 'Our calls', 'You make late hours feel like shared evenings.'],
    ['🌙', 'Your calm', 'You steady me when everything is noisy.'],
    ['🧭', 'Your direction', 'You always remind me what matters most.'],
    ['✈️', 'Your effort', 'You cross cities just to hold my hand.'],
    ['📍', 'Your check-ins', '“Did you get home safe?” means everything from you.'],
    ['💬', 'Your listening', 'You hear what I mean, not just what I say.'],
    ['☕', 'Morning texts', 'You start my day with warmth across oceans.'],
    ['🎧', 'Voice notes', 'You make distance sound close.']
];
for (let i = 11; i <= 102; i += 1) {
    reasons.push(['🌊', `Reason ${i}`, `You make long-distance love feel intentional, calm, and worth every mile. (${i})`]);
}

const tape = document.getElementById('reasonsTape');
const doubled = [...reasons, ...reasons];
tape.innerHTML = doubled
    .map(
        ([icon, title, detail]) => `
      <article class="reason-card">
        <h3><span aria-hidden="true">${icon}</span> ${title}</h3>
        <p>${detail}</p>
      </article>
    `
    )
    .join('');

const weatherGrid = document.getElementById('weatherGrid');
const weatherStatus = document.getElementById('weatherStatus');

const weatherConfig = {
    cities: [
        { name: 'Dublin', lat: 53.3498, lon: -6.2603 },
        { name: 'New Delhi', lat: 28.6139, lon: 77.2090 }
    ]
};

const weatherCodeMap = {
    0: 'clear sky',
    1: 'mainly clear',
    2: 'partly cloudy',
    3: 'overcast',
    45: 'fog',
    48: 'depositing rime fog',
    51: 'light drizzle',
    53: 'moderate drizzle',
    55: 'dense drizzle',
    61: 'slight rain',
    63: 'moderate rain',
    65: 'heavy rain',
    71: 'slight snow',
    73: 'moderate snow',
    75: 'heavy snow',
    80: 'rain showers',
    81: 'rain showers',
    82: 'violent rain showers',
    95: 'thunderstorm'
};

const fallbackWeather = [
    { name: 'Dublin', temp: 11, description: 'light rain', humidity: 83 },
    { name: 'New Delhi', temp: 31, description: 'clear sky', humidity: 38 }
];

function pairNote(a, b) {
    const diff = Math.abs(a.temp - b.temp);
    if (diff <= 1) return '💚 Same sky energy today.';
    if (a.description.includes('rain') || b.description.includes('rain')) {
        return '☔ Rain in one city—wish we could share an umbrella.';
    }
    return '🌌 Different forecasts, same horizon.';
}

function renderWeather(data, status) {
    const note = pairNote(data[0], data[1]);
    const match = Math.abs(data[0].temp - data[1].temp) <= 1;

    weatherGrid.innerHTML = data
        .map(
            (city) => `
      <article class="glass-card weather-card">
        <h3>${city.name}</h3>
        <p class="weather-temp">${Math.round(city.temp)}°C</p>
        <p>${city.description}</p>
        <p>Humidity ${city.humidity}%</p>
        <p class="section-note">${note}</p>
      </article>
    `
        )
        .join('');

    weatherStatus.innerHTML = `${status}${match ? ' <span class="match">Temperature match detected.</span>' : ''}`;
}

async function loadWeather() {
    try {
        const weather = await Promise.all(
            weatherConfig.cities.map(async (city) => {
                const params = new URLSearchParams({
                    latitude: String(city.lat),
                    longitude: String(city.lon),
                    current: 'temperature_2m,relative_humidity_2m,weather_code'
                });
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
                if (!res.ok) throw new Error('Weather fetch failed');
                const json = await res.json();
                const current = json.current || {};
                return {
                    name: city.name,
                    temp: Number(current.temperature_2m),
                    description: weatherCodeMap[current.weather_code] || 'clear',
                    humidity: Number(current.relative_humidity_2m)
                };
            })
        );

        if (weather.some((city) => Number.isNaN(city.temp) || Number.isNaN(city.humidity))) {
            throw new Error('Invalid weather payload');
        }

        renderWeather(weather, 'Live weather loaded from Open-Meteo (free, no API key).');
    } catch {
        renderWeather(fallbackWeather, 'Live weather unavailable. Showing fallback snapshot.');
    }
}

loadWeather();

const wordBank = document.getElementById('wordBank');
const poetryBoard = document.getElementById('poetryBoard');

const starterTiles = [
    'you', 'are', 'my', 'same horizon', 'across', 'time zones',
    'still us', 'moonlight', 'ocean calm', 'home', 'always', 'until next flight'
];

starterTiles.forEach((word) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tile focusable';
    button.textContent = word;
    button.draggable = true;
    button.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', word);
    });
    wordBank.appendChild(button);
});

poetryBoard.addEventListener('dragover', (event) => event.preventDefault());
poetryBoard.addEventListener('drop', (event) => {
    event.preventDefault();
    const text = event.dataTransfer.getData('text/plain');
    if (!text) return;

    const rect = poetryBoard.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left - 30, 8), rect.width - 120);
    const y = Math.min(Math.max(event.clientY - rect.top - 16, 24), rect.height - 40);

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'tile tile-placed focusable';
    chip.textContent = text;
    chip.style.left = `${x}px`;
    chip.style.top = `${y}px`;
    chip.addEventListener('click', () => chip.remove());
    poetryBoard.appendChild(chip);
});
