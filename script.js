var country = "Brunei";
var apiCovidLink = "https://api.caw.sh/v3/covid-19/countries/Brunei";
var apiCountryLink = "https://restcountries.eu/rest/v2/alpha/";
var apiVaccinatedCountryLink = "https://api.caw.sh/v3/covid-19/vaccine/coverage/countries/brn?lastdays=1&fullData=false";
var totalPopulation = 0;
const emptyText = "Please insert country name";

//
const ptr = PullToRefresh.init({
    mainElement: 'body',
    onRefresh() {
      window.location.reload();
    }
  });
  

//initial data onload
testAjax();

//on click
document.getElementById("btnSubmit").addEventListener("click", checker);

function checker(){
    if(document.getElementById("findCountry").value != ""){
        changeCountry();
    }
    else{
        document.getElementById("errorMessage").innerHTML = "Please enter country name";
    }
}

function changeCountry(){
    country = document.getElementById("findCountry").value;
    apiCovidLink = "https://api.caw.sh/v3/covid-19/countries/"+country+"";
    testAjax();
}

setInterval(() => { timer() }, 3000);

function timer(){
    if(country != null && country != ""){
        console.log("timer runs");
    }
}

function getPercentage(totalVaccinated, totalPopulation){
    return (100 * totalVaccinated / totalPopulation).toFixed(2);
}

function numAddComma(num){
    return num.toLocaleString();
}

//Dates
document.getElementById("year").innerHTML = new Date().getFullYear();
document.getElementById("todayDate").innerHTML = moment(new Date).format("(DD/MM/YYYY)");



////////////////////////////////
//method 1 using XMLHttpRequest
////////////////////////////////
function testAjax(){
    const country = document.getElementById("findCountry").value;
    const getData = (resource) => {
        //resolve will be transfering its data to 'then' and reject to 'catch' below
        return new Promise((resolve, reject) => {            
            const request = new XMLHttpRequest();
            request.onreadystatechange = function(){
                if(this.readyState == 4 && this.status == 200){
                    const data = JSON.parse(this.responseText);
                    document.getElementById("errorMessage").innerHTML = "";
                    resolve(data);
                }
                else if(this.status == 404){
                    reject("Data not found")
                }
            };
            request.open("GET", resource);
            request.send();
        });
    };

    getData(apiCovidLink).then(data => {
        totalPopulation = data["population"];
        
        ////Covid info
        document.getElementById("totalPopulation").innerHTML = numAddComma(data["population"]);      
        document.getElementById("totalCases").innerHTML = numAddComma(data["cases"]);
        document.getElementById("totalDeaths").innerHTML = numAddComma(data["deaths"]);
        document.getElementById("totalRecovered").innerHTML = numAddComma(data["recovered"]);
        
        ////Country info
        getData(apiCountryLink+data["countryInfo"].iso3).then(data => {
            //Set Textfield empty
            document.getElementById("currencies").textContent = "";
            document.getElementById("languages").textContent = "";
            document.getElementById("associationGroup").textContent = "";
            //Start map setup
            let zoom = 0;
            let areaCharLength = data["area"].toString().length;
            if(areaCharLength <= 4 ){
                zoom = 7;
            }
            else if(areaCharLength == 5){
                zoom = 5;
            }
            else if(areaCharLength > 4 && areaCharLength <= 6){
                zoom = 4;
            }
            else if(areaCharLength > 6){
                zoom = 2;
            }
            document.getElementById("mapShow").innerHTML = "<div id='pushMap' style='width: 100%; height: 100%;'>";
            var myMap = L.map('pushMap').setView([data["latlng"][0], data["latlng"][1]], zoom);
            myMap.scrollWheelZoom.disable();   
            L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: 'pk.eyJ1IjoiZGF5YXR4aWlpIiwiYSI6ImNrcDNjYXNhZzAxM2YydnFlbWhhbHJ1MXQifQ.UmhUa0ezG3CDVhUbJk7JtA'
            }).addTo(myMap);
            //End map setup
            document.getElementById("latitude").innerHTML = data["latlng"][0];
            document.getElementById("longitude").innerHTML = data["latlng"][1];
            document.getElementById("flag").src = data["flag"];
            document.getElementById("countryName").innerHTML = data["name"];
            document.getElementById("altCountryName").innerHTML = " ("+data["altSpellings"][0]+")";
            document.getElementById("capitalName").innerHTML = data["capital"];
            document.getElementById("regionName").innerHTML = data["region"];
            document.getElementById("subRegionName").innerHTML = data["subregion"];
            //border check
            data["borders"][0] != undefined ? document.getElementById("borders").innerHTML = data["borders"] : document.getElementById("borders").innerHTML = "No Nearby Borders";
            //area check
            data["area"] != null ? document.getElementById("areaSize").innerHTML = numAddComma(data["area"])+" km&#178" : document.getElementById("areaSize").innerHTML = "Not Available";
            document.getElementById("timeZone").innerHTML = data["timezones"];
            //association Group Check
            if(data["regionalBlocs"][0] != undefined){
                for(var i = 0; i < data["regionalBlocs"].length; i++){
                    document.getElementById("associationGroup").innerHTML += data["regionalBlocs"][i].name + " ("+data["regionalBlocs"][i].acronym+")" + (i === data["regionalBlocs"].length - 1 ? "" : ", ");
                }
            }
            else{
                document.getElementById("associationGroup").innerHTML = "Not Found";
            }
            //languages
            for(var i = 0; i < data["languages"].length; i++){
                document.getElementById("languages").textContent += data["languages"][i].name + (i === data["languages"].length - 1 ? "" : ", ");
            }
            document.getElementById("demonym").innerHTML = data["demonym"];
            //currencies
            for(var i = 0; i < data["currencies"].length; i++){
                document.getElementById("currencies").textContent += data["currencies"][i].name + " (" + data["currencies"][i].code + ")" + (i === data["currencies"].length - 1 ? "" : ", ");
            }
            document.getElementById("tld").innerHTML = data["topLevelDomain"].toString().toUpperCase();
            
            ////Total vaccinated info
            getData("https://api.caw.sh/v3/covid-19/vaccine/coverage/countries/"+data["alpha3Code"]+"?lastdays=1&fullData=false").then(data => {
                for(var key in data["timeline"]) {
                    var value = data["timeline"][key];
                    document.getElementById("totalVaccinated").textContent = numAddComma(value) + " ("+getPercentage(value, totalPopulation)+"%)";
                }
            })
        })
    }).catch(error => {
        document.getElementById("errorMessage").innerHTML = error;
    })    
}

/////////////////////////
////method 2 using Fetch
/////////////////////////
// function handleErrors(response){
//     if(!response.ok)
//     {
//         if(response.status === 404){
//             throw Error(response.status);
//         }
//     }
//     let data = response.json();
//     return data;
// }

// function testAjax(){
//     fetch(apiLink)
//     .then(handleErrors)
//     .then(data => {
//         document.getElementById("totalCases").innerHTML = data["cases"];
//         document.getElementById("totalDeaths").innerHTML = data["deaths"];
//         document.getElementById("totalRecovered").innerHTML = data["recovered"];
//     })
//     .catch(error => {
//         document.getElementById("errorMessage").innerHTML = "Data not found";
//     });
// }

/////////////////////////////////////////
//method 2 using Fetch (Async and Await)
/////////////////////////////////////////
// const getData = async () => {
//     let response = await fetch(apiLink);
//     if(response.status == 404){
//         throw new Error(response.status);
//     }
//     let data = await response.json();
//     return data;
// }

// function testAjax(){
//     getData()
//     .then(data => {
//         document.getElementById("totalCases").innerHTML = data["cases"];
//         document.getElementById("totalDeaths").innerHTML = data["deaths"];
//         document.getElementById("totalRecovered").innerHTML = data["recovered"];
//     })
//     .catch(error => {
//         document.getElementById("errorMessage").innerHTML = "Data not found";
//     });
// }

/////////////////
//method 3 Axios
/////////////////
// function testAjax(){
//     axios.get(apiLink)
//         .then(response => {
//             document.getElementById("totalCases").innerHTML = response.data["cases"];
//             document.getElementById("totalDeaths").innerHTML = response.data["deaths"];
//             document.getElementById("totalRecovered").innerHTML = response.data["recovered"];
//         })
//         .catch(error => {
//             if(error.response.status == 404){
//                 document.getElementById("errorMessage").innerHTML = "Data not found";
//             }
//         });
// }

//////////////////
//method 4 jQuery
//////////////////
// function testAjax(){
//     $(document).ready(function(){
//         $.ajax({
//             url: "https://api.caw.sh/v3/covid-19/countries/Brunei",
//             type: "GET",
//             success: function (response) {
//                 document.getElementById("totalCases").innerHTML = response["cases"];
//                 document.getElementById("totalDeaths").innerHTML = response["deaths"];
//                 document.getElementById("totalRecovered").innerHTML = response["recovered"];
//             },
//             error: function (error) {
//                 if(error.status == 404){
//                     document.getElementById("errorMessage").innerHTML = "Data not found";
//                 }
//             }
//         });
//     });
// }