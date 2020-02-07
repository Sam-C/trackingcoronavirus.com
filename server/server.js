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
dates = ["1/21/2020 10:00 PM", "1/22/2020 12:00 PM", ...]

rows = [
    [Anhui,Mainland China,1/3/2020,31.82571,117.2264,,1,9,15,...],
    [Beijing,Mainland China,1/3/2020,40.18238,116.4142,10,14,22,...],
    ...
    [,South Korea,1/21/2020,37.5665,126.978,,1,1,1,...],
    [Taiwan,Taiwan,1/21/2020,23.6978,120.9605,1,1,1,...],
    ...
]

provinces = {
    Anhui: [...], 
    Beijing: [...],
    // not Taiwan: [...], because province == country
}

countries = {
    "Mainland China": [...],
    "South Korea": [...],
    Taiwan: [...]
}

world = {
    "World": [...]
}

counts = [world join countries join provinces]

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

async function main() {
    let data = {};

    try {
        // for (let i = 0; i < dataSources.length; i++) {
        for (let i = 0; i < 1; i++) { // for DEBUG
            let url = dataSources[i].url;
            let fileName = dataSources[i].caseType + ".csv";

            let csvString = await rp(url);          // download csv from the web
            fs.writeFileSync(fileName, csvString);  // save a copy to disk

            // let csvString = fs.readFileSync(fileName, "utf8"); // for DEBUG

            let rows = papa.parse(csvString).data;  // convert to 2D-array

            // console.log(rows);// for DEBUG

            let dates = rows[0].slice(5);            // extract dates[]
            rows = rows.slice(1);                    // remove the header row
            let counts = calculateRegionTotal(rows); // extract counts[]

            console.log(counts);// for DEBUG
            console.log(dates);// for DEBUG

            // [trimmedDates, trimmedCount] = trim(dates, counts);   // keep 1 column for each date
            // merge(data, trimmedDates, trimmedCount);              // merge into the data object

        };
    } catch(e) {
        console.error(e);
    }
}

main();

////////////////////  functions  ////////////////////

function calculateRegionTotal(rows) {
    let provinces = {};
    let countries = {};
    let world = {};

    rows.forEach( row => {
        let province = row[0];
        let country = row[1];
        let counts = row.slice(5);

        counts = counts.map( count => {
            if (count == "") {      // empty means zero
                return 0;
            } else {                // convert from string to integer, so that + adds instead of concats
                return parseInt(count);
            }
        });

        if (province == country || province == "") {
            countries[country] = counts;
        } else {        // has two different values for province and country
            provinces[province] = counts;
            countries[country] = sum(countries[country], counts);
        }

        world["World"] = sum(world["World"], counts);
    });

    let counts = {};
    Object.assign(counts, world);
    Object.assign(counts, countries);
    Object.assign(counts, provinces);
    return counts;
}

function sum(array1, array2) {
    if (array1 === undefined && array2 === undefined){
        return new Error("Cannot sum 2 undefined arrays.")
    }

    // create array if it's not been initialized
    array1 = array1 == undefined ? new Array(array2.length).fill(0) : array1; //TODO: return array2?
    array2 = array2 == undefined ? new Array(array1.length).fill(0) : array2;

    return array1.map( (value, index) => value + array2[index] );
}