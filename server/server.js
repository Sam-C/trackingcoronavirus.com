const rp = require("request-promise");
const fs = require("fs");
const papa = require("papaparse");

////////////////////  data sources (CSV)  ////////////////////
const dataSources = [{
    caseType: "confirmed",
    url: "https://docs.google.com/spreadsheets/d/1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo/export?format=csv&id=1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo&gid=0"
}, {
    caseType: "recovered",
    url: "https://docs.google.com/spreadsheets/d/1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo/export?format=csv&id=1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo&gid=1940183135"
}, {
    caseType: "death",
    url: "https://docs.google.com/spreadsheets/d/1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo/export?format=csv&id=1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo&gid=1056055583"
}];

////////////////////  overall flow (pseudocode) ////////////////////

/*
for each source:
    download csv from the web
    save a copy to drive
    convert to 2D-array
    get country and world totals
    get date totals (and format date string)
    extract dates[], province, country, case counts[]
    merge into data.js
*/

////////////////////  data structures ////////////////////
{
/*
rows = [
    [Anhui,Mainland China,1/3/2020,31.82571,117.2264,,1,9,15,...],
    [Beijing,Mainland China,1/3/2020,40.18238,116.4142,10,14,22,...],
    ...
    [,South Korea,1/21/2020,37.5665,126.978,,1,1,1,...],
    [Taiwan,Taiwan,1/21/2020,23.6978,120.9605,1,1,1,...],
    ...
]

provinces = [
    {Anhui: [...]}, 
    {Beijing: [...]},
    // not {Taiwan: [...]}, because province == country
]

countries = [
    {"Mainland China": [...]},
    {"South Korea": [...]},
    {Taiwan: [...]}
]

world = [
    {"World": [...]}
]

regions = [world join countries join provinces]
dates = [...]

conbinded.splice(startingIndex, deleteCount)

data = {
    date: [5,6,7],
    count: {
        "Taiwan": {
            "confirmed": [1,2,3]
        }
    }
}
*/
}
////////////////////  top-level functions  ////////////////////

let data = {};

for (let i = 0; i < dataSources.length; i++) {
    let url = dataSources[i].url;
    let fileName = dataSources[i].caseType + ".csv";

    let csvString = await rp(url);          // download csv from the web
    fs.writeFileSync(fileName, csvString);  // save a copy to disk
    let rows = papa.parse(csvString);       // convert to 2D-array

    let dates = rows[0].slice(5);            // extract dates[]
    rows = rows.slice(1);                    // remove the header row
    let counts = calculateRegionTotal(rows); // extract counts[]

    [trimmedDates, trimmedCount] = trim(dates, counts);   // keep 1 column for each date
    merge(data, trimmedDates, trimmedCount);              // merge into the data object

}

////////////////////  functions  ////////////////////
