async function init() {
    const locationData = await getLocationData(await getClientIP());
    $(function () {
        $.ajax({
            type: 'GET',
            url: `https://api.forecast.io/forecast/6dbe98374cc5b8f9ea63d5ec73de9c04/${locationData.lat},${locationData.lon}?callback=?`,
            dataType: 'json',
            contentType: "application/json",
            success: function (forecastData) {
                loadPage(locationData, forecastData);
            }
        });
    });
}

function loadPage(locationData, forecastData) {
    console.log(locationData, forecastData);

    $(`#loading`).toggleClass(`hidden`);
    $(`#content`).toggleClass(`hidden`);

    $("#nav-location").html(locationData.city);

    let todayData = forecastData.daily.data[0];
    let hourData = forecastData.hourly.data[0];

    $("#location").html(`Today in ${locationData.city}, ${locationData.regionName}`);
    $("#time").html(`Accurate as of ${formatTimeWithZone(forecastData.currently.time)}`);
    $("#temperature").html(`${convertToCelsius(forecastData.currently.temperature)}°`);
    $("#summary").html(`${forecastData.currently.summary}`);
    $("#chance-of-rain").html(`${hourData.precipProbability * 100}% chance of rain until ${formatTime(forecastData.hourly.data[1].time)}`);

    document.getElementById("icon").style.backgroundImage = `url('asset/${
        getIcon(forecastData.currently.precipProbability,
            forecastData.currently.cloudCover,
            ((Date.now() > todayData.sunsetTime * 1000) || (Date.now() < todayData.sunriseTime * 1000)))}.png')`;

    $("#high-low").html(`${convertToCelsius(todayData.temperatureHigh)}° / ${convertToCelsius(todayData.temperatureLow)}°`);

    $("#date").html(`Showing for ${formatDate(todayData.time)}`);
    $("#sunrise").html(`${formatTime(todayData.sunriseTime)}`);
    $("#sunset").html(`${formatTime(todayData.sunsetTime)}`);

    $("#location-more").html(`More for ${locationData.city}, ${locationData.regionName}`);
    $("#time-more").html(`Accurate as of ${formatTimeWithZone(hourData.time)}`);
    $("#feels-like").html(`${convertToCelsius(forecastData.currently.apparentTemperature)}°`);

    $("#humidity").html(`Humidity ${hourData.humidity * 100}%`);
    $("#dew-point").html(`Dew Point ${convertToCelsius(hourData.dewPoint)}°`);
    $("#pressure").html(`Pressure ${hourData.pressure} mb`);
    $("#visibility").html(`Visibility ${hourData.visibility} km`);
    $("#ozone").html(`Ozone ${hourData.ozone} DU`);

    $("#wind-speed").html(`Wind Speed ${hourData.windSpeed} km/h`);
    $("#wind-gust").html(`Wind Gust ${hourData.windGust}%`);
    $("#wind-bearing").html(`Wind Bearing ${hourData.windBearing}°`);
    $("#uv-index").html(`UV Index ${hourData.uvIndex}`);
    $("#moon-phase").html(`Moon Phase ${todayData.moonPhase}`);

}

async function getClientIP() {
    return (await fetch(`https://api.ipify.org/?format=json`).then(res => res.json())).ip;
}

async function getLocationData(ip) {
    return await fetch(`http://ip-api.com/json/${ip}`).then(res => res.json());
}

async function getCities(name) {
    return await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}`).then(res => res.json());
}

function convertToCelsius(int) {
    return Math.round((int - 32) * (5 / 9));
}

function getIcon(precipProbability, cloudCover, night) {
    if (precipProbability > 0.50) {
        return "rain";
    }

    if (cloudCover > 0.75) {
        return "cloudy";
    } else if (cloudCover > 0.50) {
        return night ? "mostly-cloudy-night" : "mostly-cloudy-day";
    } else if (cloudCover > 0.25) {
        return night ? "partly-cloudy-night" : "partly-cloudy-day";
    } else {
        return night ? "night" : "sunny";
    }
}

function formatDate(long) {
    let date = new Date(long * 1000);
    let day = (date.getDay() + 1).toString().length === 1 ? `0${(date.getDay() + 1)}` : date.getDay() + 1;
    let month = (date.getMonth() + 1).toString().length === 1 ? `0${(date.getMonth() + 1)}` : date.getMonth() + 1;
    return `${day}/${month}`;
}

function formatTimeWithZone(long) {
    let data = new Date(long * 1000).toTimeString().split(" ");
    return `${data[0].slice(0, 5)} ${data[2].slice(1, 2) + data[3].slice(0, 1) + data[4].slice(0, 1)}`;
}

function formatTime(long) {
    let data = new Date(long * 1000).toTimeString().split(" ");
    return data[0].slice(0, 5);
}
