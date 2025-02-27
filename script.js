const apiKey = "7856412eaf46166e825a0cdc45a0a9cc";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather";
const hourlyWeatherApiUrl = "https://api.openweathermap.org/data/2.5/forecast";

// Kullanıcının girdiği şehir adına göre hava durumu getir
function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (city === "") {
    alert("Lütfen bir şehir adı girin!");
    return;
  }
  fetchWeather(
    `${weatherApiUrl}?q=${city}&units=metric&lang=tr&appid=${apiKey}`
  );
  document.getElementById("cityInput").value = "";
}

// Geolokasyon (Konuma göre hava durumu)
function getGeoWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(
          `${weatherApiUrl}?lat=${lat}&lon=${lon}&units=metric&lang=tr&appid=${apiKey}`
        );
      },
      (error) => {
        alert("Konum izni verilmedi veya bir hata oluştu.");
      }
    );
  } else {
    alert("Geolokalizasyon desteklenmiyor!");
  }
}

// Hava durumu bilgisini al ve işle
function fetchWeather(url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === "404") {
        document.getElementById(
          "weatherResult"
        ).innerHTML = `<p>Şehir bulunamadı!</p>`;
        return;
      }

      renderWeather(data); // Hava durumu bilgilerini ekrana yaz
      getHourlyWeather(data.coord.lat, data.coord.lon); // Saatlik hava durumu getir

      // Hava durumu ve saatlik tahminleri göster
      document.getElementById("weatherResult").style.display = "block";
    })
    .catch((error) => {
      console.error("Hata:", error);
      alert(
        "Hava durumu verisi alınırken bir sorun oluştu. Lütfen tekrar deneyin."
      );
    });
}

// Hava durumu bilgilerini ekrana yaz
function renderWeather(data) {
  const iconUrl = getIconUrl(data.weather[0].icon);
  const weatherHTML = `
    <div class="weather-container text-center">
      <div class="weather-header">
        <h3 class="name">${data.name}, ${data.sys.country}</h3>
      </div>

      <div class="weather-description-first">
        <h1 class="temperature">${Math.round(data.main.temp)}°C</h1>
        <img src="${iconUrl}" alt="${
    data.weather[0].description
  }" class="weather-icon">
        <h3 class="weather-description-second">${
          data.weather[0].description
        }</h3>
      </div>

      <div class="weather-details">
        <p><i class="fas fa-wind"></i><strong></strong> ${
          data.wind.speed
        } m/s</p>
        <p><i class="fas fa-tint"></i><strong></strong> ${
          data.main.humidity
        }%</p>
        <p><i class="fas fa-eye"></i><strong></strong> ${Math.round(
          data.visibility / 1000
        )} km</p>
      </div>
    </div>
  `;
  document.getElementById("weatherResult").innerHTML = weatherHTML;
}

// **Saatlik hava durumu bilgilerini çekme**
let hourlyData = [];
let startIndex = 0;

// Saatlik hava durumu başarıyla alındığında carousel'i göster
function getHourlyWeather(lat, lon) {
  fetch(
    `${hourlyWeatherApiUrl}?lat=${lat}&lon=${lon}&units=metric&lang=tr&appid=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      hourlyData = data.list;
      startIndex = 0;
      updateCarousel();

      // Eğer veriler geldiyse carousel ve okları göster
      if (hourlyData.length > 0) {
        document.getElementById("carouselItems").style.display = "block";
        document.querySelector(".controls").style.display = "flex";
        document.getElementById("prevBtn").style.display = "inline-block";
        document.getElementById("nextBtn").style.display = "inline-block";
      }
    })
    .catch((error) => console.error("Hata:", error));
}

// **Saatlik hava durumu kartlarını güncelle**
function updateCarousel() {
  let carouselItems = "";
  let groupSize = 6;

  for (let i = startIndex; i < startIndex + groupSize; i++) {
    if (i >= hourlyData.length) break;

    const hour = hourlyData[i];
    const time = new Date(hour.dt * 1000).toLocaleTimeString().slice(0, 5);
    const iconUrl = getIconUrl(hour.weather[0].icon);
    const temp = Math.round(hour.main.temp);

    carouselItems += `
      <div class="col-md-2 text-center">
        <h5 class="carouselItem-time">${time}</h5>
        <img src="${iconUrl}" alt="Weather icon">
        <p class="carouselItem-temp">${temp}°C</p>
      </div>
    `;
  }

  document.getElementById(
    "carouselItems"
  ).innerHTML = `<div class="row">${carouselItems}</div>`;
}

// **Carousel butonları**
function nextSlide() {
  if (startIndex + 6 < hourlyData.length) {
    startIndex++;
    updateCarousel();
  }
}

function prevSlide() {
  if (startIndex > 0) {
    startIndex--;
    updateCarousel();
  }
}

// **Hava durumu simgesi URL'sini döndüren yardımcı fonksiyon**
function getIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}.png`;
}
