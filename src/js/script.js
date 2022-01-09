"use strict";
import '../styles/style.css';
import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';
(function init() {
    const locationAlert = document.querySelector('.location-alert');
    const timeElement = document.querySelector('#time');
    const dateElement = document.querySelector('#date');
    const currentWeatherItems = document.querySelector('#current-weather-items');
    const timeZone = document.querySelector('#time-zone');
    const country = document.querySelector('#country');
    const weatherForecast = document.querySelector('#weather-forecast');
    const weatherForm = document.querySelector('.weather-form');
    const cityInput = document.querySelector('.weather-form input');
    const openWeatherKey = 'd5fc663a6d7f62f55c75a87bc4ae565c';
    const locationIQKey = 'pk.78294abcdf55195e4cd03d3bd61373af';
    const UnsplashKey = 'om8CZNPOpR2UfNxITf64or5ZUNKnDRSs09V07_o06YU';






    // get day name from milliseconds
    const getDayFromMS = (ms) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let date = new Date(ms * 1000);
        let dayName = days[date.getDay()];
        return dayName;
    }


    //format minutes and hours wrtten format
    const formatTime = (time) => {
        let num = time < 10 ? `0${time}` : time;
        return num;
    }


    // get an image from the unsplash api depending on the query (city name in this case) inserted to the url parameter
    function getImg(data) {
        let city = data;
        let UnsplashURL = `https://api.unsplash.com/search/photos?query=${city}&client_id=${UnsplashKey}`;
        fetch(UnsplashURL)
            .then(response => responseMethod(response))
            // parameters:  w = width, q = quality, fm = format;
            .then(data => {
                let img = `${data.results[0].urls.raw}&w=1500&q=70&fm=jpg`;
                document.querySelector('.overlay').style.backgroundImage = `linear-gradient(45deg, rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)),url('${img}')`;
            })
            .catch(error => console.log(error))
    }


    // adding weather data to the UI 
    const weatherFormUISuccess = (data) => {
        let cityName = data.name;
        let countryName = data.sys.country;
        let dayName = getDayFromMS(data.dt);
        let {temp, humidity} = data.main;
        let {description, icon} = data.weather[0];
        let windSpeed = data.wind.speed;
        // changing the background image to the image of the city name entered
        getImg(cityName);

        // building the weather item with the data
        let searchItemContent = `
            <div class="place-container">
                <div class="time-zone">${cityName}/${countryName}</div>
            </div>
            <div class="day">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description} icon" class="w-icon">
            <p class="weather-desc">${description}</p>
            <div class="temp">Temp - ${Math.round(temp)}&#176; C</div>
            <div class="current-weather">
                <div class="current-weather__item">
                    <div>Humidity:</div>
                    <div>${humidity}</div>
                </div>
                <div class="current-weather__item">
                    <div>Wind Speed:</div>
                    <div>${windSpeed}</div>
                </div>
            </div>
        `
        let searchItem = document.querySelector('.search-item');
        searchItem.innerHTML = searchItemContent;
        let error = document.querySelector('.error');
        // remove previous error messages if it present
        if(error) {
            error.parentElement.removeChild(error);
        }
        // if the container of the new created weather element is hidden
        if (searchItem.classList.contains('hidden')) {
            // remove the hidden class
            searchItem.classList.remove('hidden');
        }

    } 

    // adding error messages to the UI if the api request failed
    const weatherFormUIFail = (error) => {
        // erreo info logged
        console.log(error);
        let div = document.createElement('div');
        div.classList.add('error');
        let p1 = document.createElement('p');
        p1.textContent = 'unable to find the city';
        let p2 = document.createElement('p');
        p2.textContent = 'please check the spelling and try again';
        div.append(p1, p2);
        let searchItem = document.querySelector('.search-item')
        if (!searchItem.classList.contains('hidden')) {
            searchItem.classList.add('hidden');
        }
        weatherForm.parentElement.insertAdjacentElement('beforeend', div);
    }


    // getting time and date in the user location, and desplay it in the UI
    const setDate = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const date = new Date();
        const minuets = date.getMinutes();
        const hour = date.getHours();
        const day = date.getDay();
        const currentDate = date.getDate();
        const month = date.getMonth();
        const HoursIn12Format = hour >= 13 ? hour % 12 : hour;
        const AMOrPM = hour >= 12 ? 'PM' : 'AM';
        timeElement.innerHTML = `${formatTime(HoursIn12Format)}:${formatTime(minuets)} <span class="date-container__am-pm" id="am-pm">${AMOrPM}</span>`;
        dateElement.textContent = `${days[day]}, ${currentDate} ${months[month]}`;
    }


    // handle the response of the fetch data
    const responseMethod = (response) => {
        // if the response failed throw an error, (can be logged by the catch method)
        if (!response.ok) {
            throw new Error((response.status + ': ' + response.statusText));
        }
        // return the processed response
        return response.json();
    } 



    // building items from the data provided and adding it to the UI
    const defaultWeatherUISuccess = (data) => {
        let {humidity, pressure,  wind_speed} = data.current;

        timeZone.textContent = data.timezone;

        currentWeatherItems.innerHTML = `
            <div class="current-weather__item">
                <div>Humidity:</div>
                <div>${humidity}</div>
            </div>
            <div class="current-weather__item">
                <div>Pressure:</div>
                <div>${pressure}</div>
            </div>
            <div class="current-weather__item">
                <div>Wind Speed:</div>
                <div>${wind_speed}</div>
            </div>
        `;


        let forecastContent = '';
        // looping through the data and building the weather items
        data.daily.forEach((el, i) => {
            let day = getDayFromMS(el.dt);
            let icon = el.weather[0].icon;
            let alt = el.weather[0].description;
            forecastContent += `
            <li class="future-forecast__item card">
                <div class="day">${day}</div>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${alt}" class="w-icon">
                <div class="temp">Night - ${Math.round(el.temp.night)}&#176; C</div>
                <div class="temp">Day - ${Math.round(el.temp.day)}&#176; C</div>
            </li>
            `
        });
        // adding a heading to the built content
        let heading = document.createElement('h2');
        heading.textContent = 'daily weather forecast at your location';
        weatherForecast.parentElement.insertBefore(heading, weatherForecast);
        weatherForecast.innerHTML = forecastContent;

    }

    // provide an error message to the UI if the request was not successful
    const defaultWeatherUIFail = (error) => {
        let heading = document.createElement('h2');
        heading.textContent = 'the weather forecast at your location is not available';
        weatherForecast.parentElement.insertBefore(heading, weatherForecast);
        console.log(error);
    }






    // get the user location to get the weather info in their location
    const getUserLocation = () => {
        // with the help of the location browser api we get the longitude and latitude
        const watch = navigator.geolocation.getCurrentPosition((success) => {
            const {latitude, longitude} = success.coords;
            // using the longitude and latitude to request the weather data
            const defaultWeatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly&units=metric&appid=${openWeatherKey}`;
            fetch(defaultWeatherURL)
                .then((response) => responseMethod(response))
                .then((data) => defaultWeatherUISuccess(data))
                .catch((error) => defaultWeatherUIFail(error));
            getCity(latitude, longitude);

            // get the name of a city from passing the longitude and latitude of the city
            function getCity(lat, long) {
        
                const GetCityURL = `https://us1.locationiq.com/v1/reverse.php?key=${locationIQKey}&lat=${lat}"&lon=${long}&format=json`;
                fetch(GetCityURL)
                    .then((response) => responseMethod(response))
                    .then((data) => getCityName(data))
                    .then(data => getImg(data) )
                    .catch((error) => console.log(error));
                
                    
            
                function getCityName(data) {
                        var city = data.address.city;
                        return city;
                }

                
            }
            
        }, () => alert('this app needed your location data to display the weather info at your location.'));

    }

    // getting the current date and time every second
    setInterval(() => setDate(), 1000);
    //
    getUserLocation();


    weatherForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // make sure the city input field is not empty 
        if (cityInput.value.trim() !== '' && cityInput.value) {
            let city = cityInput.value;
            // clear the input field
            cityInput.value = '';
            // fetching the searched city weather data from openweather api
            const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherKey}&units=metric`;
            fetch(currentWeatherURL)
            .then(response => responseMethod(response))
            .then(data => weatherFormUISuccess(data))
            .catch(error => weatherFormUIFail(error))
        }
        
    });


    // removing the location alert when the button is pressed
    locationAlert.querySelector('.btn').addEventListener('click', (e) => {
        e.target.parentElement.parentElement.removeChild(locationAlert);
    });
})();




