

//HTML Elements
const inputOrigin = document.getElementById('origin-input');
const inputDestination = document.getElementById('destination-input');
const inputDeparture = document.getElementById('departure-date');
const inputReturn = document.getElementById('return-date');
const favouritesDiv = document.getElementById('favourites');
const buttonsDiv = document.getElementById('clear');
const clearBtn = document.createElement('button');
clearBtn.setAttribute('id', 'clear-button');
const favouritesBtn = document.getElementById('favourites-btn');
//Weather
const apiKey = `359fbb9063e60407b575e9a14683190b`;

//Global Variables
let favouritesArray=[];
let emptyFavouritesItem = {displayName: '', origin: '', destination: '', departure:'' , return: ''};
let clearBtnExists = false;


//Collect User's Favourites Details and Store in an Object
function addDetails (){ 
    let favouritesItem = {displayName: '', origin: '', destination: '', departure:'' , return: ''};
    favouritesItem.origin = inputOrigin.value.toLowerCase().trim();
    favouritesItem.destination = inputDestination.value.toLowerCase().trim();
    favouritesItem.departure = inputDeparture.value;
    favouritesItem.return =  inputReturn.value;
    favouritesItem.displayName = `${capitalCity(favouritesItem.origin)} >> ${capitalCity(favouritesItem.destination)}`;
    
    addToFavourites(favouritesItem);
}

//Add User's Current Favourite Search to the FavouritesArray
function addToFavourites (item) {
    let checkItem=[];
    for (i=0; i<favouritesArray.length; i++) {
        if(favouritesArray[i].displayName === item.displayName && favouritesArray[i].departure === item.departure && favouritesArray[i].return === item.return){
            checkItem.push('true');
        } else {
            checkItem.push('false');
        }
    }
    if (checkItem.includes('true')){
        checkItem;
    } else {
        favouritesArray.push(item);
        localise();
    }
    renderButtons(favouritesArray);
}

//Set Favourites Array to Local Storage or Retrieve It If It Already Exists
function commence (){
    let localFavourites = localStorage.getItem('localFavourites');
    if (localFavourites){
        favouritesArray = JSON.parse(localFavourites);
        renderButtons(favouritesArray);
    } else {
        localString = JSON.stringify(favouritesArray);
        localStorage.setItem('localFavourites', localString);
    };
};

//Save Search Favourites Array to Local Storage
function localise (){
    localString = JSON.stringify(favouritesArray);
    localStorage.setItem('localFavourites', localString);
};

function capitalCity (word) {
    const city = word;
    const capitalLetter = city.charAt(0).toUpperCase();
    const restOfWord = city.slice(1);
    const capitalisedWord = capitalLetter + restOfWord;
    return capitalisedWord;
};

//Create and Display Previous Search Buttons
function renderButtons (array){
    favouritesDiv.innerHTML = '';

    const ulEl = document.createElement('ul');
    for (i=0; i<array.length; i++){
        let liEl = document.createElement('li');
        liEl.setAttribute('class', 'favourites-list');
        let button = document.createElement('button');
        button.setAttribute('class', 'favourites-button');
        button.innerText = array[i].displayName;
        let cityBtn = array[i];
        let favouritesInput = {currentCity: '', destinationCity: '', departureDate: '', returnDate:'', geocoded: {origin: {lat: '', lon: '', cityCode: '', airportCode: '', airportName: ''}, destination: {lat: '', lon: '', cityCode: '', airportCode: '', airportName: ''}}};
            favouritesInput.currentCity = array[i].origin;
            favouritesInput.destinationCity = array[i].destination;
            favouritesInput.departureDate = array[i].departure.split('-').reverse().join('-');
            favouritesInput.returnDate = array[i].return.split('-').reverse().join('-');

        //Call the APIs with the User's Favourites Information When Buttons Are Clicked
        button.addEventListener('click', (e)=>{
            e.preventDefault();
            //Flights
            spinner.style.display="block";
            returnExists = true;
            initialise();
            // currency.innerHTML='';
            $('#currency-container').fadeOut();
            $('#currency-container').fadeIn(1000);
            $('#Weather').fadeOut();
            $('#Weather').fadeIn(1000);
            userInput.currentCity = favouritesInput.currentCity;
            userInput.destinationCity = favouritesInput.destinationCity;
            userInput.departureDate = favouritesInput.departureDate;
            userInput.returnDate = favouritesInput.returnDate;

            //Change Input Section to Display Saved Values
            inputOrigin.value = capitalCity(favouritesInput.currentCity);
            inputDestination.value = capitalCity(favouritesInput.destinationCity);
            inputDeparture.value = favouritesInput.departureDate.split('-').reverse().join('-');
            inputReturn.value = favouritesInput.returnDate.split('-').reverse().join('-');

            origin = favouritesInput.currentCity;
            destination = favouritesInput.destinationCity;
            queryInfo(favouritesInput);

            //Weather
            const city = favouritesInput.destinationCity;
            if (city) {
                getWeather(city, apiKey);
                getForecast(city, apiKey);
            }

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
                let date = dayjs(timeString).format('ddd DD MMM YYYY');
                var time ='';
                let count = 0;
                // let clock = setInterval(()=>{time = dayjs(timeString).add(count, 'second').format('HH:mm:ss'); count++; return time}, 1000);

                

                const weatherHtml = `
                      <div class="col-12">
                          <h2>${data.name}</h2>
                          <p>Local Time: ${date} <span id='local-time'> </span></p>
                          <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
                          <p>Temperature: ${data.main.temp} °C</p>
                          <p>Weather: ${data.weather[0].main}</p>
                          <p>Wind Speed: ${data.wind.speed} KPH</p>
                          <p>Humidity: ${data.main.humidity}%</p>
                  `;
                  let clock = setInterval(()=>{time = dayjs(timeString).add(count, 'second').format('HH:mm:ss'); count++; $('#local-time').html('. '+ time);}, 1000);
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

            //Currency
            $("#currency_text").empty();
            destinationString = favouritesInput.destinationCity.toUpperCase();
            originString =  favouritesInput.currentCity.toUpperCase();
            if (destinationString === "" || originString === "") {
                return
            }
            let querydestinationURL = locationAPI + destinationString + locationAPIkey;
            let queryoriginURL = locationAPI + originString + locationAPIkey;
        
            // below is geocoding API code
            fetch(querydestinationURL)
            .then(function (response) {return response.json();})
            .then(function (data) {
                let destinationCountry = data[0].country
                fetch(queryoriginURL)
                .then(function (response) {return response.json();})
                .then(function (data) {
                    let originCountry = data[0].country
            
                // below is database to convert country code to currency code
                fetch(databaseLink)
                .then(function (response) {return response.json();}).then(function(data){
                    return(data.find(item => item['ISO3166-1-Alpha-2'] === destinationCountry)); ;})
                    .then(function (final) {
                        let destinationCurrencyname = final["ISO4217-currency_name"];
                        // Here are 2 if statements for the undesirable possibilities present in the country database
                        if (destinationCurrencyname === null) {
                            let consolationString = "We're sorry, we don't seem to have data on the currency exchange rate for your destination";
                            $("#currency_text").append(consolationString);
                            return;
                        }
                        if (destinationCurrencyname.indexOf(",") > -1) {
                            let consolationString = "We're sorry, we don't seem to have data on the currency exchange rate for your destination";
                            $("#currency_text").append(consolationString);
                            return;
                        }
                        let destinationcurrencyCode = final["ISO4217-currency_alphabetic_code"];
        
                        fetch(databaseLink)
                        .then(function (response) {return response.json();}).then(function(data){
                            return(data.find(item => item['ISO3166-1-Alpha-2'] === originCountry)); ;})
                            .then(function (final) {
                                let originCurrencyname = final["ISO4217-currency_name"];
                                // Here are 2 if statements for the undesirable possibilities present in the country database
                                if (originCurrencyname === null) {
                                    let consolationString = "We're sorry, we don't seem to have data on the currency exchange rate for your destination";
                                    $("#currency_text").append(consolationString);
                                    return;
                                }
                                if (originCurrencyname.indexOf(",") > -1) {
                                    let consolationString = "We're sorry, we don't seem to have data on the currency exchange rate for your destination";
                                    $("#currency_text").append(consolationString);
                                    return;
                                }
                                let origincurrencyCode = final["ISO4217-currency_alphabetic_code"];
                                let querycurrencyURL = currencyAPI + origincurrencyCode + "/" + destinationcurrencyCode;
                
                        // below is exchange API to convert currency code to exchange rate
                        fetch(querycurrencyURL)
                        .then(function (response) {return response.json();})
                        .then(function (data) {
                            let conversionRate = data.conversion_rate;
                            let createdString = ("The current exchange rate from " + originCurrencyname + " (" + origincurrencyCode + ") to " + destinationCurrencyname + " (" + destinationcurrencyCode + ") is: ");
                            $("#currency_text").append(createdString);
                            $("#currency-display").html(conversionRate);
                        })
                    })
                })
            })
            })
        });

        liEl.appendChild(button);
        ulEl.appendChild(liEl);
    };

    favouritesDiv.appendChild(ulEl);
};

//Clear the Favourites
function clear (){
    favouritesArray = [];
    clearBtnExists = false;
    
    localise();
    commence();
};

//Create and append the clear favourites button
function clearFavourites () {
    if (!clearBtnExists && favouritesArray.length>0) {
            clearBtn.style.display = 'inline-block';
            clearBtn.innerText = 'Clear Favourites';
            buttonsDiv.append(clearBtn);
            clearBtnExists = true;
            
            clearBtn.addEventListener('click', (e)=> {
            e.preventDefault();
            clearBtn.style.display = 'none';
            clear()});
    } else {
        clearBtn;
    };
};

//Initiate Add Favourites Button
favouritesBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    addDetails();
    clearFavourites();
});

//Initiate Local Storage
commence();
clearFavourites ();
