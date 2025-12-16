const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const currentWeatherItemsEl = document.getElementById("current-weather-items");
const timezone = document.getElementById("time-zone");
const countryEl = document.getElementById("country");
const weatherForecastEl = document.getElementById("weather-forecast");
const currentTempEl = document.getElementById("current-temp");

const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ---------- CITY FROM IP ---------- */
fetch("https://ipwho.is/")
  .then(res => res.json())
  .then(data => {
    if (data?.city) {
      timezone.textContent = data.city;
    } else {
      console.info("Location info not available from IP service.");
    }
  })
  .catch(() => {
    console.info("Unable to fetch location from IP service.");
  });

/* ---------- TIME & DATE ---------- */
setInterval(() => {
  const time = new Date();
  const h = time.getHours();
  const m = time.getMinutes();
  const d = time.getDay();

  timeEl.innerHTML = `${h % 12 || 12}:${m < 10 ? "0" : ""}${m}
    <span id="am-pm">${h >= 12 ? "PM" : "AM"}</span>`;
  dateEl.innerHTML = `${days[d]}, ${time.getDate()} ${months[time.getMonth()]}`;
}, 1000);

/* ---------- WEATHER ---------- */
const API_KEY = "49cc8c821cd2aff9af04c9f98c36eb74";
getWeatherData();

function getWeatherData() {
  if (!navigator.geolocation) {
    console.info("Geolocation not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.latitude}&lon=${coords.longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`
      )
        .then(res => res.json())
        .then(data => showWeatherData(data))
        .catch(() => {
          console.info("Weather service is currently unavailable.");
        });
    },
    () => {
      console.info("Location permission denied by user.");
    }
  );
}

/* ---------- SAFE RENDER ---------- */
function showWeatherData(data) {
  if (!data || !data.current) {
    console.info(
      "Weather data could not be loaded. This may be due to API access limitations or temporary service issues."
    );
    return;
  }

  const { humidity, pressure, sunrise, sunset, wind_speed } = data.current;

  timezone.textContent = data.timezone;
  countryEl.textContent = `${data.lat}N ${data.lon}E`;

  currentWeatherItemsEl.innerHTML = `
    <div class="weather-item"><div>Humidity</div><div>${humidity}%</div></div>
    <div class="weather-item"><div>Pressure</div><div>${pressure}</div></div>
    <div class="weather-item"><div>Wind Speed</div><div>${wind_speed}</div></div>
    <div class="weather-item"><div>Sunrise</div><div>${moment(sunrise * 1000).format("hh:mm A")}</div></div>
    <div class="weather-item"><div>Sunset</div><div>${moment(sunset * 1000).format("hh:mm A")}</div></div>
  `;

  let forecastHTML = "";

  data.daily.forEach((day, idx) => {
    if (idx === 0) {
      currentTempEl.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png">
        <div class="other">
          <div class="day">${moment(day.dt * 1000).format("dddd")}</div>
          <div class="temp">Night - ${day.temp.night}°C</div>
          <div class="temp">Day - ${day.temp.day}°C</div>
        </div>
      `;
    } else {
      forecastHTML += `
        <div class="weather-forecast-item">
          <div class="day">${moment(day.dt * 1000).format("ddd")}</div>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
          <div class="temp">Night - ${day.temp.night}°C</div>
          <div class="temp">Day - ${day.temp.day}°C</div>
        </div>
      `;
    }
  });

  weatherForecastEl.innerHTML = forecastHTML;
}
