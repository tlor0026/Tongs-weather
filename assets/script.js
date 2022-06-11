var searchCity = $("#searchCity");
var pastSearch = $("#pastSearch");
var weather = $("#current-date");
var forecast = $("#5day");
var forecastTitle= $("#forecast")

var cityList = []
var bad = false;
var clearMessageCode;

// Set the day
var realTime = dayjs();

function init() {
    searchCity.children("button").on("click", getData);
    svStorage();
    pullStorage();
}

//Local Storage
function saveCity(city) {
    if(localStorage.getItem("cityList") !== null) {
        cityList = JSON.parse(localStorage.getItem("cityList"));
    }
    while(cityList.length > 9) {
        cityList.pop();
    }
    for(var i = 0; i < cityList.length; i++) {
        if(city === cityList[i]) {
            return
        }
    }
    cityList.reverse();
    cityList.push(city);
    cityList.reverse();
    
    localStorage.setItem("cityList", JSON.stringify(cityList));
    updatePrev();
}

//Call/Fetch from weather API
function getData(event) {
    event.preventDefault();
    var city = "";
    if(event.target.textContent === "Search") {
        city = searchCity.children("input").val();
        searchCity.children("input").val("");
    } else {
        city = event.target.textContent;
    }
    city = city.toUpperCase();
    if(!city) {
        invalidInput();
        return;
    }
    var requestUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=c4fae18c7ffb537aed4bbf6ecc19f509&units=metric`;
    fetch(requestUrl)
    .then(function (response) {
        return response.json();
        })
        .then(function (data) {
            if(data.length) {
                var lat = data[0].lat;
                var lon = data[0].lon;
                requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=c4fae18c7ffb537aed4bbf6ecc19f509&units=metric`;
                fetch(requestUrl)
                .then(function (response) {
                    return response.json();
                })
                    .then(function (data) {
                        displayWeather(data, city);    
                        displayForecast(data);
                        saveCity(city);   
                    });
                } else {
                    invalidInput();
                }
            });
}
function invalidInput() {
    if(!bad) {
        var dayContent = $("<p>");
        dayContent.text("Please type in a valid city");
        dayContent.css("color", "white");
        searchCity.append(dayContent); 
        clearAnswer();  
    } else {
        clearAnswer();
    }
}
function clearAnswer() {
    if(bad) {
        bad = false;
        clearTimeout(clearMessageCode);
        clearAnswer();
    } else {
        bad = true;
        clearMessageCode = setTimeout(function() {
            searchCity.children().eq(3).remove();
            bad = false;
        }, 1500);
    }
}

// Current weather
function displayWeather(data, city) {
    var title = weather.children().eq(0).children("h2")
    var conditions = weather.children().eq(0).children("img");
    var temp = weather.children().eq(1);
    var wind = weather.children().eq(2);
    var humidity = weather.children().eq(3);
    var uvIndex = weather.children().eq(4);
    
    weather.addClass("card bg-light mb-3");
    
    title.text(`${city} ${realTime.format("MM/DD/YYYY")}`);
    conditions.attr("src",`https://openweathermap.org/img/w/${data.current.weather[0].icon}.png`);
    temp.text(`Temp: ${data.current.temp}°C`);
    wind.text(`Wind: ${Math.round((data.current.wind_speed * 3.6))} kph`);
    humidity.text(`Humidty: ${data.current.humidity}%`);
    uvIndex.text(`UV Index: ${data.current.uvi}`);
    
    var uv = data.current.uvi;
    if(uv < 4) {
        uvIndex.css("background-color", "green");
    }else if(uv < 7) {
        uvIndex.css("background-color", "yellow");
    }else {
        uvIndex.css("background-color", "red");
    }
    
}

// 5 Day weather
function displayForecast(data) {
    forecastTitle.css("visibility", "visible");
    for(var i = 0; i < 5; i++) {
        var date = forecast.children().eq(i).children().eq(0);
        var conditions = forecast.children().eq(i).children("img");
        var temp = forecast.children().eq(i).children().eq(2);
        var wind = forecast.children().eq(i).children().eq(3);
        var humidity = forecast.children().eq(i).children().eq(4);
        
        forecast.children().eq(i).addClass("card text-white bg-dark mb-3 mx-1")
        
        var index = i + 1;
        date.text(realTime.add((i + 1), "d").format("MM/DD/YYYY"));
        conditions.attr("src",`https://openweathermap.org/img/w/${data.daily[index].weather[0].icon}.png`);
        temp.text(`Temp: ${data.daily[index].temp.day}°C`);
        wind.text(`Wind: ${Math.round(data.daily[index].wind_speed * 3.6)} kph`);
        humidity.text(`Humidity: ${data.daily[index].humidity}%`);
    }
}

//Past search section
function svStorage() {
    if(localStorage.getItem("cityList") !== null) {
        cityList = JSON.parse(localStorage.getItem("cityList"));
    }
    localStorage.setItem("cityList", JSON.stringify(cityList));
}
function pullStorage() {
    var i = 0;
    while(i < cityList.length && i < 10) {
        var pst = $("<button>");
        pst.text(`${cityList[i]}`);
        pst.attr("class", "col-8 my-1 btn btn-dark");
        pastSearch.append(pst);
        i++;
    }
    pastSearch.children("button").on("click", getData)
}
function updatePrev() {
    if(cityList.length < 10) {
        var past = $("<button>");
        past.text(`${cityList[0]}`);
        past.attr("class", "col-8 my-1 btn btn-blue");
        pastSearch.append(past);
    } else {
        for(var i = 0; i < 10; i++) {
            pastSearch.children().eq(i).text(cityList[i]);
        }
    }    
}

init();