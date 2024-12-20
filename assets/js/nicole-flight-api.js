const austen = '65460f2d682dbe6e454f0b9ada6fd285';
const t = 'fnqqbjye9q3u7ye83dmqf7bz';

//HTML Elements
const flightDiv = document.getElementById('flight-info');
const flightBtn = document.getElementById('flight-btn');
const originInput = document.getElementById('origin-input');
const destinationInput = document.getElementById('destination-input');
const departureDate = document.getElementById('departure-date');
const returnDate = document.getElementById('return-date');
let spinner = document.getElementById('spinner');
const forecast = document.getElementById('forecast');
const currency = document.getElementById('currency-display');
const currencyBox = document.getElementById('currency-box');

//Datepicker
$('#departure-date').datepicker({
    autoclose: true,
    clearBtn: true,
    startDate: '0d',
    todayHighlight: true,
    format: 'dd-mm-yyyy',
});
$('#return-date').datepicker({
    autoclose: true,
    clearBtn: true,
    startDate: '0d',
    todayHighlight: true,
    format: 'dd-mm-yyyy',
});

//Global Variables
let userInput = {currentCity: '', destinationCity: '', departureDate: '', returnDate:'', geocoded: {origin: {lat: '', lon: '', cityCode: '', airportCode: '', airportName: ''}, destination: {lat: '', lon: '', cityCode: '', airportCode: '', airportName: ''}}};
let userOrigin = originInput.value;
let userDestination = destinationInput.value;
let directFlights = 1;
let originCode;
let destinationCode;
let query;
const cityKeys = [userInput.geocoded.origin, userInput.geocoded.destination];
let results;
let isDirect;
let flight;
let totalDuration;
let origin;
let destination;
let returnCall = false;
let falseOrigin = [];
let falseDestination = [];
let departureInfo; 
let transferInfo; 
let arrivalInfo;
let flightInfo;
let allFlights = [];
let searchedName;
let outboundData = [];
let returnData = [];
let entireArray = [];
let allEntireArrays =[];
let returnExists = false;
let outboundArray = [];
let allOutboundArrays = [];
let returnArray = [];
let allReturnArrays = [];
let displayNum = 5;
const departureKeys =['city', 'date', 'time', 'airport', 'flight'];
const transferKeys =['date', 'arrival', 'airport', 'stopover', 'flight', 'dates', 'departure'];
const arrivalKeys =['city', 'date', 'time', 'airport', 'duration'];
let originArray=[];
let destinationArray=[];
let originCodeArray=[];
let destinationCodeArray=[];
let isReturn = false;
const errorDisplay = document.getElementById('error-display');
const errorDiv = document.createElement('div');
errorDiv.setAttribute('id', 'error-message');
const errorMsg = `There is an error with your search. <br/>Please try again.`;
const noFlights = 'We were unable to find flights for your chosen dates and cities. Please adjust your search and try again.'


//Use Open Weather API to Geocode Origin and Destination Cities to Their Latitude and Longitude Versions
function queryInfo (input) {
    const userQuery = input;
    originArray=[];
    destinationArray=[];
    const cityQuery = [userQuery.currentCity, userQuery.destinationCity];

    const originCode = `https://api.openweathermap.org/geo/1.0/direct?q=${cityQuery[0]}&limit=5&appid=${austen}`;
    const destinationCode = `https://api.openweathermap.org/geo/1.0/direct?q=${cityQuery[1]}&limit=5&appid=${austen}`;
    Promise.all([
        fetch(originCode).then((response) => {return response.json()}).then((data1) => {  
            const city = data1[0];
            const lat = city?.lat;
            const lon = city?.lon;
            const cityData1 =[lat, lon, 1];
            lat ? cityArray(cityData1) : errorCity(userOrigin);
        }).catch((err)=>{
            errorMessage (errorMsg);
        }),
        fetch(destinationCode).then((response) => {return response.json()}).then((data2) =>{  
            const city = data2[0];
            const lat = city?.lat;
            const lon = city?.lon;
            const cityData2 =[lat, lon];
            lat ? cityArray(cityData2) : errorCity(userDestination); 
        }).catch((err)=>{
            errorMessage (errorMsg);
        }),
    ]);
};

//Store Latitude and Longitude for Origin and Destination Cities in Arrays
function cityArray(name){
   name.length===3 ? originArray.push(name[0], name[1]) : destinationArray.push(name[0], name[1]);  
   destinationArray.length && originArray.length > 0? nearestAirport(): originArray;
};

//Use Lufthansa API and Latitude and Longitude to Search for Nearest Airport to User's Input Origin and and Destination Cities
function nearestAirport() {
    userInput.geocoded.origin.lat = originArray[0];
    userInput.geocoded.origin.lon = originArray[1];
    userInput.geocoded.destination.lat = destinationArray[0];
    userInput.geocoded.destination.lon = destinationArray[1];

    let originLat = originArray[0];
    let originLon = originArray[1];
    let destinationLat = destinationArray[0];
    let destinationLon = destinationArray[1];
   
    const originQuery = `https://api.lufthansa.com/v1/mds-references/airports/nearest/${originLat},${originLon}`;
    const destinationQuery = `https://api.lufthansa.com/v1/mds-references/airports/nearest/${destinationLat},${destinationLon}`;

    //Isolate the City Code of the City In Which the Nearest Airport is Located
    // Fetch requests
    Promise.all([
        fetch(originQuery , {
            headers: {Authorization: `Bearer ${t}`}
        }).then((response) => {return response.json()}).then((data1) => {  
                const code = data1.NearestAirportResource.Airports.Airport[0].CityCode;
                userInput.geocoded.origin.cityCode = code;

                let airportArray = data1.NearestAirportResource.Airports.Airport;
                airportArray.map((item)=>{
                    let airportCode = item.AirportCode;
                    let airportName = item.Names.Name[1]['$'];
                    let airportItem = {code: airportCode, name: airportName };
                    originCodeArray.push(airportItem);
                });

                return code;
        }).then((code)=>{
                const codeArray = [code,1];
                code ? outbound(codeArray) : errorCode(userOrigin); 
        }).catch((err)=>{
            errorMessage (errorMsg);
        }),
        fetch(destinationQuery , {
            headers: {Authorization: `Bearer ${t}`}
        }).then((response) => {return response.json()}).then((data2) => {  
                const code = data2.NearestAirportResource.Airports.Airport[0].CityCode;
                userInput.geocoded.destination.cityCode = code;
                let airportArray = data2.NearestAirportResource.Airports.Airport;
                
                //Collect an Array of Surrounding Airport Namess and Their Corresponding Codes to Identify the Airport Code Later in the Flight Search
                airportArray.map((item)=>{
                    let airportCode = item.AirportCode;
                    let airportName = item.Names.Name[1]['$'];
                    let airportItem = {code: airportCode, name: airportName };
                    destinationCodeArray.push(airportItem);
                });
                return code;
        }).then((code2)=>{
                code2 ? outbound(code2) : errorCode(userDestination);
        }).catch((err)=>{
            errorMessage (errorMsg);
        })
      ]);
};

//Use City Codes to Populate Query URL for Outbound Flights, Then Call API for Flight Information
function outbound (code) {
    code.length === 2 ? originCode = code[0]: destinationCode = code;
    if (originCode && destinationCode) {
        query = `https://api.lufthansa.com/v1/operations/schedules/${originCode}/${destinationCode}/${userInput.departureDate}`;  
        flightData(origin, destination, flightInfo);
        }
};

//After Outbound Flight Search Has Revealed the Airport Codes, Use Them to Call the Flight Data Function Again For Return Flights
function inbound () {
    query = `https://api.lufthansa.com/v1/operations/schedules/${userInput.geocoded.destination.airportCode}/${userInput.geocoded.origin.airportCode}/${userInput.returnDate}?`; 
    isReturn = true;
    flightData(destination, origin, flightInfo);        
};

//Call Lufthansa Flight API and Store Flight Details in Various Variables and Arrays
function flightData(departureCity, arrivalCity,arr) {  
    origin='';
    destination ='';
    allFlights = [];

    //Fetch request
        fetch(query , {
            headers: {Authorization: `Bearer ${t}`}
        })
        .then((response) => {
            return response.json();
        })
        .then((data) => {  
            const flights = data?.ScheduleResource.Schedule;

            for (i=0; i<displayNum; i++){
                //Check Whether or Not Flight Is Direct
                isDirect = data?.ScheduleResource.Schedule[i].Flight.Departure;
            
                isDirect ? flight = data?.ScheduleResource.Schedule[i].Flight : flight = data?.ScheduleResource.Schedule[i].Flight[0];
                totalDuration = data?.ScheduleResource.Schedule[i].TotalJourney.Duration;             
            
                //Flight Information
                //Origin City
                origin = departureCity;

                //Flight Origin Airport Code
                const outboundDepAirport = flight?.Departure.AirportCode;

                isReturn ? userInput : userInput.geocoded.origin.airportCode = outboundDepAirport;

                //If there Isn't a Match, the getAirportName Function Is Called
                if (isReturn){
                    origin;
                }else{
                    //Compare the Airport Code with the Array of Airport Codes and Names Generated Earlier During the Nearest Airport Request. If the Aiport Code Matches One In the Array of Airport Codes and Names, the Corresponding Airport Name is Assigned to the Flight Information 
                    //Origin Airport Name
                    falseOrigin = [];
                    originCodeArray.map((item)=>{
                        item.code === outboundDepAirport ? userInput.geocoded.origin.airportName = item.name : falseOrigin.push('false');
                    });
                    falseOrigin.length === originCodeArray.length ? getAirportName(outboundDepAirport, 'origin') : origin;
                }
                
                isReturn ? destination = userInput.geocoded.origin.airportName : origin = userInput.geocoded.origin.airportName;

                //Origin Flight Number
                let carrier = flight?.MarketingCarrier;
                const outboundNum = `${carrier.AirlineID} ${carrier.FlightNumber}`;

                //Origin Date
                const outboundDateTime = flight?.Departure.ScheduledTimeLocal.DateTime;
                const outboundDepDate = outboundDateTime.slice(0,10).split('-').reverse().join('/');
                
                //Origin Time
                const outboundDepTime = outboundDateTime.slice(11,16);
                
                //Transfer Information - Only for Non-Direct Flights
                //Transfer Arrival Date
                const transferArrDate = flight?.Arrival.ScheduledTimeLocal.DateTime.slice(0,10).split('-').reverse().join('/');

                //Transfer Arrival Time
                const transferArrTime = flight?.Arrival.ScheduledTimeLocal.DateTime.slice(11,16);

                //Transfer Airport
                const transferArrAirport = flight?.Arrival.AirportCode;

                //Transfer Stopover
                const stopover = 'Stopover';

                isDirect ? flight = data?.ScheduleResource.Schedule[i].Flight : flight = data?.ScheduleResource.Schedule[i]?.Flight[2] ||  data?.ScheduleResource.Schedule[i].Flight[1] ;

                //Outbound Transfer Flight Number
                const transferCarrier = flight?.MarketingCarrier;
                const transferNum = `${transferCarrier.AirlineID} ${transferCarrier.FlightNumber}`;

                //Outbound Transfer Depature Date
                const transferDateTime = flight?.Departure.ScheduledTimeLocal.DateTime;
                const transferDepDate = transferDateTime.slice(0,10).split('-').reverse().join('/');
                
                //Outbound Transfer Depature Time
                const transferDepTime = transferDateTime.slice(11,16);

                //Arrival City
                destination = arrivalCity;

                //Outbound Flight Arrival Date 
                const outboundArrDate = flight?.Arrival.ScheduledTimeLocal.DateTime.slice(0,10).split('-').reverse().join('/');

                //Outbound Flight Arrival Time
                const outboundArrTime = flight?.Arrival.ScheduledTimeLocal.DateTime.slice(11,16);

                //Outbound Flight Arrival Airport
                const outboundArrAirport = flight?.Arrival.AirportCode;

                //Compare the Airport Code with the Array of Airport Codes and Names Generated Earlier During the Nearest Airport Request. If the Aiport Code Matches One In the Array of Airport Codes and Names, the Corresponding Airport Name is Assigned to the Flight Information 
                if (isReturn){
                    destination;
                } else{
                    falseDestination=[];
                    destinationCodeArray.map((item)=>{
                    item.code === outboundArrAirport ? userInput.geocoded.destination.airportName = item.name : falseDestination.push('false');
                });

                falseDestination.length === destinationCodeArray.length ? getAirportName(outboundArrAirport, 'destination') : destination;
                }            
                
                isReturn ? userInput : userInput.geocoded.destination.airportCode = outboundArrAirport;

                //Flight Arrival Airport Name
                isReturn ? origin = userInput.geocoded.destination.airportName : destination = userInput.geocoded.destination.airportName;
                
                //Outbound Flight Duration
                // const  outboundDurationTotal = flight[0].TotalJourney.Duration.slice(2);
                let  outboundDurationTotal = totalDuration.slice(2).split('H').join('H ');
                outboundDurationTotal = outboundDurationTotal.split('DT').join('1 Day ');

                departureInfo = [origin, outboundDepDate, outboundDepTime, outboundDepAirport, outboundNum];
                
                transferInfo = [transferArrAirport, transferArrDate, transferArrTime, transferArrAirport, stopover, transferArrAirport, transferDepDate, transferDepTime, transferArrAirport, transferNum,];
                
                arrivalInfo = [destination, outboundArrDate, outboundArrTime, outboundArrAirport, outboundDurationTotal];
                isDirect ? transferInfo = []: transferInfo;

                flightInfo = [departureInfo, transferInfo, arrivalInfo];
                arr = flightInfo;

                allFlights.push(flightInfo);
            }
            data ? outboundFlight(allFlights) : errorMessage(noFlights);

        }).catch((err)=>{
            errorMessage (noFlights);
        });
        return flightInfo;
};

//Get Airport Name from Its Airport Code If It Isn't In the Nearest Aiport Array
function getAirportName(airportCode, location){
    searchedName = 'Airport';
    let code = airportCode;
    let place = location;
    let airportItem;
    let n;

    const nameQuery = `https://api.lufthansa.com/v1/mds-references/airports/${code}?limit=20&offset=0&LHoperated=0`;
    fetch(nameQuery , {
        headers: {Authorization: `Bearer ${t}`}
    }).then((response) => {return response.json()}).then((data) => {  
            searchedName = data?.AirportResource.Airports.Airport.Names.Name;            
            for(i=0; i< searchedName.length; i++){
                if(data?.AirportResource.Airports.Airport.Names.Name[i]['@LanguageCode'] === 'EN'){
                    n=[i];
                } else {
                    n;
                }
            }
            n ? n : n=1;

            if (place === 'origin'){
                userInput.geocoded.origin.airportName = data?.AirportResource.Airports.Airport.Names.Name[n]['$'];
                origin = data?.AirportResource.Airports.Airport.Names.Name[n]['$'];
            } else {
                userInput.geocoded.destination.airportName = data?.AirportResource.Airports.Airport.Names.Name[n]['$'];
                destination = data?.AirportResource.Airports.Airport.Names.Name[n]['$'];
            }
            
            airportItem = {code: airportCode, name: data?.AirportResource.Airports.Airport.Names.Name[n]['$']};

            originCodeArray.push(airportItem);
            destinationCodeArray.push(airportItem);            
    }).catch((err)=>{
        errorMessage (errorMsg);
    });
};

//Prepare Flight Data to Be Rendered in the Browser
function outboundFlight(arr){  
    
    arr.map((flight)=>{
        let a = arr.indexOf(flight);
        let departure = [{city: ''}, {date: ''}, {time: ''}, {airport: ''}, {flight: ''}];
        let transferArr = [{city: ''}, {date: ''}, {time: ''}, {airport: ''},{duration: ''}]; 
        let transferDep = [{city: ''}, {date: ''}, {time: ''}, {airport: ''}, {flight: ''}];
        let arrival = [{city: ''}, {date: ''}, {time: ''}, {airport: ''},{duration: ''}]; 
        
        let transfer1 = flight[1].slice(0,5);
        let transfer2 = flight[1].slice(5);

        for (let i=0; i<departure.length; i++){
            let key = Object.keys(departure[i]);
            let arrivalKey = Object.keys(arrival[i]);

            departure[i][key] = flight[0][i];
            arrival[i][arrivalKey]= flight[2][i];
            transferArr[i][arrivalKey] = transfer1[i];
            transferDep[i][key] = transfer2[i];
        }

        if(allOutboundArrays.length<displayNum){
            outboundArray = [departure, transferArr, transferDep, arrival];
            allOutboundArrays.push(outboundArray);
            allOutboundArrays.length === displayNum ? inbound() :  outboundArray;
        } else {
            returnArray = [departure, transferArr, transferDep, arrival];
            allReturnArrays.push(returnArray);
            entireArray = [allOutboundArrays[a], allReturnArrays[a]];
            allEntireArrays.push(entireArray);
            allEntireArrays.length === displayNum ? renderData(allEntireArrays): returnArray;
        }
    });
};

//Create HTML Elements to Render Data in the Browser 
function renderData(arr){        
    let onePlane = '<span id="more-planes"><i class="fa-solid fa-plane one more-plane"></i></span>';
    // let onePlane = '<span id="more-planes">></span>';
    let twoPlanes = '<span id="centre-planes">> <i class="fa-solid fa-circle"></i> ></span>';
    let outboundCentrepiece;
    let returnCentrepiece = '<i class="fa-solid fa-plane"></i>';
    let moreCentrepiece = onePlane;
    
    //Container for Flight Elements
    const flightContainer = document.createElement('div')
    flightContainer.setAttribute('id', 'flight-container');
    const ulEl = document.createElement('ul')
    ulEl.setAttribute('id', 'flight-ul');
    let combinedCodeArrays = [...originCodeArray, ...destinationCodeArray];

    //Create List Items
    for (i=0; i<displayNum; i++){
        outboundArray = arr[i][0];
        returnArray = arr[i][1];
        //Make Sure Airport Names Are Included
        outboundArray[0][0].city ? outboundArray :  outboundArray[0][0].city = userInput.geocoded.origin.airportName;
        outboundArray[3][0].city ? outboundArray :  outboundArray[3][0].city = userInput.geocoded.destination.airportName;
        returnArray[0][0].city ? returnArray :  returnArray[0][0].city = userInput.geocoded.destination.airportName;
        returnArray[3][0].city ? returnArray :  returnArray[3][0].city = userInput.geocoded.origin.airportName;
                   
        outboundArray[0][0].city ? outboundArray :  outboundArray[0][0].city = userInput.geocoded.origin.airportCode;
        outboundArray[3][0].city ? outboundArray :  outboundArray[3][0].city = userInput.geocoded.destination.airportCode;
        returnArray[0][0].city ? returnArray :  returnArray[0][0].city = userInput.geocoded.destination.airportCode;
        returnArray[3][0].city ? returnArray :  returnArray[3][0].city = userInput.geocoded.origin.airportCode;

        outboundArray[1][4].duration ? outboundCentrepiece = twoPlanes : outboundCentrepiece = onePlane;
        returnArray[1][4].duration ? returnCentrepiece = twoPlanes : returnCentrepiece = onePlane;

        const outboundCentreInfo = ['', '', outboundCentrepiece, '', ''] ;
        const returnCentreInfo = ['', '', returnCentrepiece, '', ''];
        const liEl = document.createElement('li')
        liEl.setAttribute('id', `flight-li-${i+1}`);

        //Outbound Divs
        const flightTextboxO = document.createElement('div')
        flightTextboxO.setAttribute('class', 'flight-textbox-o');
        const flightDisplayO = document.createElement('div')
        flightDisplayO.setAttribute('class', 'flight-display-o');

        //Outbound Departure
        const departureTextboxO = document.createElement('div')
        departureTextboxO.setAttribute('class', 'departure-textbox-o');

        const centreTextboxO = document.createElement('div')
        centreTextboxO.setAttribute('class', 'centre-textbox-o');

        //Outbound Arrival
        const arrivalTextboxO = document.createElement('div')
        arrivalTextboxO.setAttribute('class', 'arrival-textbox-o');

        //Return Divs
        const flightTextboxR = document.createElement('div')
        flightTextboxR.setAttribute('class', 'flight-textbox-r');
        const flightDisplayR = document.createElement('div')
        flightDisplayR.setAttribute('class', 'flight-display-r');

        //Return Departure
        const departureTextboxR = document.createElement('div')
        departureTextboxR.setAttribute('class', 'departure-textbox-r');

        const centreTextboxR = document.createElement('div')
        centreTextboxR.setAttribute('class', 'centre-textbox-r');

        //Return Arrival
        const arrivalTextboxR = document.createElement('div')
        arrivalTextboxR.setAttribute('class', 'arrival-textbox-r');

        //More Info Div
        const moreInfoDiv = document.createElement('div');
        moreInfoDiv.setAttribute('class', 'more-div');
        moreInfoDiv.style.display = 'none';
        const moreInfoTextbox = document.createElement('div');
        moreInfoTextbox.setAttribute('class', `more-textbox`);

        //More Info Outbound Divs
        const moreInfoOutboundTitle = document.createElement('div');
        moreInfoOutboundTitle.setAttribute('class', `more-outbound-title`);
        moreInfoOutboundTitle.innerHTML = 'Outbound';
        const moreInfoOutboundDisplay = document.createElement('div');
        moreInfoOutboundDisplay.setAttribute('class', `more-outbound-display`);

        //More Info Transfer Arrival Divs
        const moreArrivalTextboxOT = document.createElement('div')
        moreArrivalTextboxOT.setAttribute('class', `more-arrival-textbox-o`);

        //More Info Transfer Departure Divs
        const moreDepartureTextboxO = document.createElement('div');
        moreDepartureTextboxO.setAttribute('class', `more-departure-textbox-o`);

        const moreCentreTextboxO = document.createElement('div')
        moreCentreTextboxO.setAttribute('class', `more-centre-textbox-o`);

        //More Info Destination Arrival Divs
        const moreArrivalTextboxO = document.createElement('div')
        moreArrivalTextboxO.setAttribute('class', `more-arrival-textbox-o`);

        //More Info Return Divs
        const moreInfoReturnTitle = document.createElement('div');
        moreInfoReturnTitle.setAttribute('class', `more-return-title`);
        moreInfoReturnTitle.innerHTML = 'Return';
        const moreInfoReturnDisplay = document.createElement('div');
        moreInfoReturnDisplay.setAttribute('class', `more-return-display`);

        //More Info Return Departure Divs
        const moreDepartureTextboxR = document.createElement('div')
        moreDepartureTextboxR.setAttribute('class', `more-departure-textbox-r`);

        const moreCentreTextboxR = document.createElement('div')
        moreCentreTextboxR.setAttribute('class', `more-centre-textbox-r`);

        //More Info Return Transfer Arrival Divs
        const moreArrivalTextboxR = document.createElement('div')
        moreArrivalTextboxR.setAttribute('class', `more-arrival-textbox-r`);

        //More Info Return Transfer Departure Divs
        const moreDepartureTextboxRT = document.createElement('div')
        moreDepartureTextboxRT.setAttribute('class', `more-departure-textbox-r`);

        //Button
        const moreBtn = document.createElement('button');
        moreBtn.setAttribute('id', `more-button-${i+1}`);
        moreBtn.setAttribute('class', `more-button`);
        moreBtn.innerHTML = "See More";
                
        //Create Divs to Hold Flight Information
        for (j=0; j<5; j++){
            //Outbound
            //Departure
            let departureInfoDivO = document.createElement('div');
            departureInfoDivO.setAttribute('id',`o-departure-${departureKeys[j]}-${[i+1]}`);
            departureInfoDivO.innerHTML = outboundArray[0][j][departureKeys[j]];
            departureTextboxO.append(departureInfoDivO);

            let centreInfoDivO = document.createElement('div');
            centreInfoDivO.setAttribute('id',`o-centre-${[i+1]}`);
            centreInfoDivO.setAttribute('class',`centre-o`);
            centreInfoDivO.innerHTML = outboundCentreInfo[j];
            centreTextboxO.append(centreInfoDivO);
            
            // Arrival
            let arrivalInfoDivO = document.createElement('div');
            arrivalInfoDivO.setAttribute('id',`o-arrival-${arrivalKeys[j]}-${[i+1]}`);
            arrivalInfoDivO.innerHTML = outboundArray[3][j][arrivalKeys[j]];
            arrivalTextboxO.append(arrivalInfoDivO);

            //Return
            //Departure
            let departureInfoDivR = document.createElement('div');
            departureInfoDivR.setAttribute('id',`r-departure-${departureKeys[j]}-${[i+1]}`);
            departureInfoDivR.innerHTML = returnArray[0][j][departureKeys[j]];
            departureTextboxR.append(departureInfoDivR);

            let centreInfoDivR = document.createElement('div');
            centreInfoDivR.setAttribute('id',`r-centre-${[i+1]}`);
            centreInfoDivR.setAttribute('class',`centre-r`);
            centreInfoDivR.innerHTML = returnCentreInfo[j];
            centreTextboxR.append(centreInfoDivR);
            
            //Arrival
            let arrivalInfoDivR = document.createElement('div');
            arrivalInfoDivR.setAttribute('id',`r-arrival-${arrivalKeys[j]}-${[i+1]}`);
            arrivalInfoDivR.innerHTML = returnArray[3][j][arrivalKeys[j]];
            arrivalTextboxR.append(arrivalInfoDivR);

            //Transfer - Outbound Arrival
            let arrivalInfoDivOT = document.createElement('div');
            arrivalInfoDivOT.setAttribute('id',`t-arrival-${arrivalKeys[j]}-${[i+1]}`);
            arrivalInfoDivOT.innerHTML = outboundArray[1][j][arrivalKeys[j]];
            moreArrivalTextboxOT.append(arrivalInfoDivOT);
            
            //Transfer - Outbound Departure
            let departureInfoDivOT = document.createElement('div');
            departureInfoDivOT.setAttribute('id',`t-departure-${departureKeys[j]}-${[i+1]}`);
            departureInfoDivOT.innerHTML = outboundArray[2][j][departureKeys[j]];
            moreDepartureTextboxO.append(departureInfoDivOT);

            //Transfer - Return Arrival
            let arrivalInfoDivRT = document.createElement('div');
            arrivalInfoDivRT.setAttribute('id',`t-arrival-${arrivalKeys[j]}-${[i+1]}`);
            arrivalInfoDivRT.innerHTML = returnArray[1][j][arrivalKeys[j]];
            moreArrivalTextboxR.append(arrivalInfoDivRT);

            //Transfer - Return Departure
            let departureInfoDivRT = document.createElement('div');
            departureInfoDivRT.setAttribute('id',`t-departure-${departureKeys[j]}-${[i+1]}`);
            departureInfoDivRT.innerHTML = returnArray[2][j][departureKeys[j]];
            moreDepartureTextboxRT.append(departureInfoDivRT);
        };

        //The See More Button Functionality
        let outArrText = arrivalTextboxO.innerHTML;
        let retDepText = departureTextboxR.innerHTML;

        moreBtn.addEventListener('click', (e)=>{
            e.preventDefault();
            
            if(moreInfoDiv.style.display==='block') {
                $(moreInfoDiv).slideUp();
                moreInfoOutboundTitle.style.display='none';
                arrivalTextboxO.innerHTML = outArrText;
                departureTextboxR.innerHTML = retDepText;
                centreTextboxO.innerHTML = twoPlanes;
                centreTextboxR.innerHTML = twoPlanes;
                moreBtn.innerHTML = 'See more';

            } else{
                $(moreInfoDiv).slideDown();
                moreInfoOutboundTitle.style.display='block';
                moreInfoDiv.style.display='block';
                arrivalTextboxO.innerHTML = moreArrivalTextboxOT.innerHTML;
                departureTextboxR.innerHTML = moreDepartureTextboxRT.innerHTML;
                centreTextboxO.innerHTML = onePlane;
                centreTextboxR.innerHTML = onePlane;
                moreBtn.innerHTML = 'See less';
            };    
        });

        //Append Created Div Elements to the Page
        //More Info Divs
        moreArrivalTextboxO.innerHTML = arrivalTextboxO.innerHTML;
        moreDepartureTextboxR.innerHTML = departureTextboxR.innerHTML;
        moreCentreTextboxO.innerHTML = moreCentrepiece;
        moreCentreTextboxR.innerHTML = moreCentrepiece;

        moreInfoOutboundDisplay.append(moreDepartureTextboxO, moreCentreTextboxO,moreArrivalTextboxO);            
        moreInfoReturnDisplay.append(moreDepartureTextboxR, moreCentreTextboxR,moreArrivalTextboxR);
        moreInfoDiv.append(moreInfoOutboundDisplay, moreInfoReturnTitle, moreInfoReturnDisplay); 

        //Outbound Container Divs
        flightDisplayO.append(departureTextboxO, centreTextboxO, arrivalTextboxO);
        flightTextboxO.append(moreInfoOutboundTitle, flightDisplayO, moreBtn);

        //Return Container Divs
        flightDisplayR.append(departureTextboxR, centreTextboxR, arrivalTextboxR);
        flightTextboxR.append(flightDisplayR, moreBtn);

        //Append Divs to li Element
        liEl.append(flightTextboxO, moreInfoDiv, flightTextboxR);
        ulEl.append(liEl);
        if (isDirect){
            moreBtn.style.display='none';
            liEl.setAttribute('class', 'flight-items');
        }else{
            liEl.removeAttribute('class', 'flight-items');
        };   
    };
    flightContainer.append(ulEl)

    //Append Div to the index.html Div.
    flightDiv.append(flightContainer);

    //Hide Spinner
    spinner.style.display="none";
};

//Create City Not Found Error Message
function errorCity(place){
    let location = place;
    const notFound = `We couldn't find ${location}. Try again with a different city.`;
    errorMessage(notFound);
}

//Create Airport Not Found Error Message
function errorCode(place){
    let location = place;
    const notFound = `We couldn't find any airports near ${location}. Try again with a different city.`;
    errorMessage(notFound);
}

//Display error message
function errorMessage (message) {
    spinner.style.display='none';
    errorDiv.innerHTML = message;
    errorDisplay.appendChild(errorDiv);
    errorDiv.style.display = 'block';
    let timeout = setTimeout(()=>{errorDiv.style.display = 'none'}, 5000);
};

//Set Values to Zero When Search Button Is Clicked
function initialise () {
    outboundArray = [];
    returnArray = [];
    originCode ='';
    destinationCode='';
    originCodeArray = [];
    destinationCodeArray = [];
    isReturn = false;
    origin = '';
    destination='';
    flightDiv.innerHTML = '';
    allFlights=[];
    allOutboundArrays = [];
    allReturnArrays = [];
    allEntireArrays = [];
            
    let userInput = {currentCity: '', destinationCity: '', departureDate: '', returnDate:'', geocoded: {origin: {lat: '', lon: '', cityCode: '', airportCode: '', airportName: ''}, destination: {lat: '', lon: '', cityCode: '', airportCode: '', airportName: ''}}};
    userInput.geocoded.origin.airportName = 'Airport'; 
    userInput.geocoded.destination.airportName = 'Airport';
};

//Button to Submit Search and Capture User Input
flightBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    initialise();
    currency.innerHTML='';
    userOrigin = originInput.value;
    userDestination = destinationInput.value;
    let originSearch = originInput.value.toLowerCase().trim();
    let destinationSearch = destinationInput.value.toLowerCase().trim();
    let depDate = departureDate.value;
    let retDate = returnDate.value;

    userInput.currentCity = originSearch;
    userInput.destinationCity = destinationSearch;
    userInput.departureDate = departureDate.value.split('-').reverse().join('-');
    userInput.returnDate = returnDate.value.split('-').reverse().join('-');
    origin = userInput.currentCity;
    destination = userInput.destinationCity;
    returnExists = true;

    let theDeparture = dayjs(`${userInput.departureDate}`);
    let theReturn = dayjs(`${userInput.returnDate}`);

//Check the Return Date Is After the Departure Date and All Details Are Filled In 
    if (theReturn.diff(theDeparture, 'days')<0){
        let errorDate = 'Your return date cannot be before your departure date';
        errorMessage(errorDate);
        return;
    }else if (originInput.value && destinationInput.value && depDate && retDate){
        spinner.style.display="block";
        $('#currency-container').fadeOut();
        $('#currency-container').fadeIn(1000);
        $('#Weather').fadeOut();
        $('#Weather').fadeIn(1000);
        // forecast.style.opacity = "1";
        $('#forecast').fadeOut();
        $('#forecast').fadeIn(1000);
        
        queryInfo(userInput);
    } else {
        let errorInput = 'Please fill in all the search details.'
        errorMessage(errorInput);
    };       
});

