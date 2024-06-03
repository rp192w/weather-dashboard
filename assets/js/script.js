document.addEventListener('DOMContentLoaded', () => {
  const apiKey = 'cfb418a7941ab06aaa990202497a08bb';
  const cityForm = document.getElementById('city-form');
  const cityInput = document.getElementById('city-input');
  const searchHistory = document.getElementById('search-history');
  const currentWeather = document.getElementById('current-weather');
  const forecast = document.getElementById('forecast');

  let history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];

  cityForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const city = cityInput.value.trim();
      if (city) {
        try {
            await fetchWeather(city);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        } finally {
            cityInput.value = '';
        }
    }
});

  async function fetchWeather(city) {
      try {
          const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
          const geoData = await geoResponse.json();
          if (geoData.length === 0) {
              alert('City not found');
              return;
          }

          const { lat, lon, name } = geoData[0];
          const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
          const weatherData = await weatherResponse.json();

          displayCurrentWeather(name, weatherData);
          displayForecast(weatherData);

          if (!history.includes(name)) {
              history.push(name);
              localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
              updateSearchHistory();
          }
      } catch (error) {
          console.error('Error fetching weather data:', error);
      }
  }

  function displayCurrentWeather(city, data) {
      const current = data.list[0];
      const weatherHtml = `
          <div class="weather-card">
              <h2>${city} (${new Date(current.dt * 1000).toLocaleDateString()})</h2>
              <p><strong>Temp:</strong> ${current.main.temp}°F</p>
              <p><strong>Wind:</strong> ${current.wind.speed} MPH</p>
              <p><strong>Humidity:</strong> ${current.main.humidity} %</p>
              <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}.png" alt="${current.weather[0].description}">
          </div>
      `;
      currentWeather.innerHTML = weatherHtml;
  }

  function displayForecast(data) {
      forecast.innerHTML = '<h2>5-Day Forecast:</h2>';
      const forecastHtml = data.list
          .filter((_, index) => index % 8 === 0)
          .map(forecast => `
              <div class="forecast-card">
                  <h3>${new Date(forecast.dt * 1000).toLocaleDateString()}</h3>
                  <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                  <p><strong>Temp:</strong> ${forecast.main.temp} °F</p>
                  <p><strong>Wind:</strong> ${forecast.wind.speed} MPH</p>
                  <p><strong>Humidity:</strong> ${forecast.main.humidity} %</p>
              </div>
          `).join('');
      forecast.innerHTML += forecastHtml;
  }

  function updateSearchHistory() {
      searchHistory.innerHTML = history.map(city => `<button class="history-btn">${city}</button>`).join('');
  }

  searchHistory.addEventListener('click', (event) => {
      if (event.target.classList.contains('history-btn')) {
          fetchWeather(event.target.textContent);
      }
  });

  updateSearchHistory();
});
