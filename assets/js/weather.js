$(document).ready(function () {
  const apiKey = `359fbb9063e60407b575e9a14683190b`; // Use your actual API key

  $("#flight-btn").on("click", function () {
    // e.preventDefault();
    const city = $("#destination-input").val();
    if (city) {
      getWeather(city, apiKey);
      getForecast(city, apiKey);
    }
  });

  function getWeather(city, apiKey) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        displayWeather(data);
      });
  }

  function getForecast(city, apiKey) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    fetch(forecastUrl)
      .then((response) => response.json())
      .then((data) => {
        displayForecast(data);
      });
  }

  function displayWeather(data) {
    const weatherDisplay = $("#Weather");
    if (data.cod !== 200) {
      weatherDisplay.html(`<p>City not found. Please try again.</p>`);
      return;
    }

    // Calculate local time
    const timezoneOffset = data.timezone;
    const localTime = new Date(new Date().getTime() + timezoneOffset * 1000);
    const timeString = localTime.toUTCString().replace(" GMT", "");

    const weatherHtml = `
          <div class="col-12">
              <h2>${data.name}</h2>
              <p>Local Time: ${timeString}</p>
              <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
              <p>Temperature: ${data.main.temp} °C</p>
              <p>Weather: ${data.weather[0].main}</p>
              <p>Wind Speed: ${data.wind.speed} KPH</p>
              <p>Humidity: ${data.main.humidity}%</p>
              
          </div>
      `;
              // <button class="btn btn-primary" onclick="addToFavorites('${data.name}')">Add to Favorites</button>
    weatherDisplay.html(weatherHtml);
  }

  function displayForecast(data) {
    const forecastDisplay = $("#forecast");
    if (data.cod !== "200") {
      forecastDisplay.html(`<p>Forecast not available.</p>`);
      return;
    }
    let forecastHtml = `<div class="col-12"><h3>5-Day Forecast:</h3></div>`;
    data.list.forEach((forecast, index) => {
      if (index % 8 === 0) {
        forecastHtml += `
                    <div class="col-md-2 forecast-card">
                        <h5>${new Date(
                          forecast.dt_txt
                        ).toLocaleDateString()}</h5>
                        <img src="https://openweathermap.org/img/wn/${
                          forecast.weather[0].icon
                        }.png" alt="Weather icon">
                        <p>Temp: ${forecast.main.temp}°C</p>
                        <p>Wind: ${forecast.wind.speed} KPH</p>
                        <p>Humidity: ${forecast.main.humidity}%</p>
                    </div>
                `;
      }
    });
    forecastDisplay.html(forecastHtml);
  }

  window.addToFavorites = function (city) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.includes(city)) {
      favorites.push(city);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      updateFavoritesList();
    }
  };

  function updateFavoritesList() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const favoritesList = $("#favorites-list");
    favoritesList.empty();
    favorites.forEach((city) => {
      const cityBtn = $(
        `<button class="list-group-item list-group-item-action">${city}</button>`
      ).click(() => {
        getWeather(city, apiKey);
        getForecast(city, apiKey);
      });
      favoritesList.append(cityBtn);
    });
  }

  updateFavoritesList();
});
