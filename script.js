var country = "Brunei";
var apiCovidLink = "https://api.caw.sh/v3/covid-19/countries/Brunei";
var apiCountryLink = "https://restcountries.eu/rest/v2/alpha/";
const emptyText = "Please insert country name";

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

function numAddComma(num){
    return num.toLocaleString();
}

//Dates
document.getElementById("year").innerHTML = new Date().getFullYear();
document.getElementById("todayDate").innerHTML = " ("+new Date().toLocaleDateString()+")"

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
        
        document.getElementById("totalPopulation").innerHTML = numAddComma(data["population"]);        
        document.getElementById("totalCases").innerHTML = numAddComma(data["cases"]);
        document.getElementById("totalDeaths").innerHTML = numAddComma(data["deaths"]);
        document.getElementById("totalRecovered").innerHTML = numAddComma(data["recovered"]);
            getData(apiCountryLink+data["countryInfo"].iso3).then(data => { 
                document.getElementById("flag").src = data["flag"];
                document.getElementById("countryName").innerHTML = data["name"];
                document.getElementById("altCountryName").innerHTML = " ("+data["altSpellings"][0]+")";
                document.getElementById("capitalName").innerHTML = data["capital"];
                document.getElementById("regionName").innerHTML = data["region"];
                document.getElementById("subRegionName").innerHTML = data["subregion"];
                //border check
                data["borders"][0] != undefined ? document.getElementById("borders").innerHTML = data["borders"] : document.getElementById("borders").innerHTML = "No Nearby Borders";
                document.getElementById("areaSize").innerHTML = numAddComma(data["area"])+" km&#178";
                document.getElementById("timeZone").innerHTML = data["timezones"];
                //association Group Check
                if(data["regionalBlocs"][0] != undefined){
                    document.getElementById("associationGroupAcronym").innerHTML = data["regionalBlocs"][0].acronym;
                    document.getElementById("associationGroupName").innerHTML = " ("+data["regionalBlocs"][0].name+")";
                }
                else{
                    document.getElementById("associationGroupAcronym").innerHTML = "Not Defined";
                    document.getElementById("associationGroupName").innerHTML = "";
                }
                document.getElementById("language").innerHTML = data["languages"][0].name;
                document.getElementById("demonym").innerHTML = data["demonym"];
                document.getElementById("currencies").innerHTML = data["currencies"][0].code;
                document.getElementById("currenciesName").innerHTML = " ("+data["currencies"][0].name+")";
                document.getElementById("tld").innerHTML = data["topLevelDomain"].toString().toUpperCase();
                console.log(data);
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