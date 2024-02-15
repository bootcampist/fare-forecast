// Sid's currency exchange code
// const currencyAPI = 'https://v6.exchangerate-api.com/v6/cce8439a497e07a97ad9f20f/pair/';
const  a = 'eb3d55a074f43b30d0a257a0';
const currencyAPI = `https://v6.exchangerate-api.com/v6/${a}/pair/`;
const locationAPI = "https://api.openweathermap.org/geo/1.0/direct?q=";
const locationAPIkey = "&appid=7029ec148d2666f47569499650a8ea2e";
const databaseLink = "https://pkgstore.datahub.io/core/country-codes/country-codes_json/data/616b1fb83cbfd4eb6d9e7d52924bb00a/country-codes_json.json";
let destinationString;
let originString;
let querydestinationURL;
let queryoriginURL
let querycurrencyURL;

// user submits city --> geocoding API takes the city and returns a country code --> another database, link below, takes country code and returns a currency code --> currency exchange API takes this currency code to return conversion ratez
$("#flight-btn").on("click", function (event) {
    event.preventDefault();
    $("#currency_text").empty();
    destinationString = $("#destination-input").val().toUpperCase();
    originString =  $("#origin-input").val().toUpperCase();
    if (destinationString === "" || originString === "") {
        return
    }
    querydestinationURL = locationAPI + destinationString + locationAPIkey;
    queryoriginURL = locationAPI + originString + locationAPIkey;

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
                // let querydestinationcurrencyURL = currencyAPI + destinationcurrencyCode;

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
                    let createdString = ("The current exchange rate from " + originCurrencyname + " (" + origincurrencyCode + ") to " + destinationCurrencyname + " (" + destinationcurrencyCode + ") is :");
                    $("#currency_text").append(createdString);
                    $("#currency-display").html(conversionRate);
                })
            })
        })
    })
    })

    })