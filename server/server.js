const request = require("request");
const fs = require("fs");
const papa = require("papaparse")

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


////////////////////  intermediate data structures  ////////////////////

/* right after extractData()

let data = {
    dates: ["1/21/2020 10:00 PM", ...],
    regions: [{
        province: "Anhui",
        country: "Mainland China",
        case_counts: [...]
    }, {
        province: "",
        country: "Thailand",
        case_counts: [...]
    }, {
        ...
    }]
};
*/

/* right after calculateCountryAndWorldTotal()

let data = {
    dates: ["Jan 21"],
    regions: [{
        name: "Anhui",
        case_counts: [...]
    }, {
        name: "Mainland China", ...
    }, {
        name: "China", ...
    }, {
        name: "Thailand", ...
    }, {
        ...
    }]
};
*/

////////////////////  overall flow (pseudocode) ////////////////////

/*
for each source:
    download csv from the web
    save a copy to drive
    convert to 2D-array
    extract dates[], province, country, case counts[]
    get country and world totals
    get date totals (and format date string)
    merge into data.js
*/

////////////////////  top-level functions  ////////////////////

/*
let data = {};
for (let i = 0; i < dataSources.length; i++) {
    let csvString = fetchCsv(url);
    saveToDisk(fileName, csvString);
    let array2D = convertTo2DArray(csvString);
    let caseData = extractData(array2D);
    caseData = calculateCountryAndWorldTotal(caseData);
    caseData = calculateDateTotal(caseData);
    merge(data, caseData);
}
*/

////////////////////  ? ////////////////////

// let data = {};
// for (let i = 0; i < dataSources.length; i++) {
//     let csvString = await fetchCsv(source.url);
//     fs.writeFileSync(`${source.caseType}.csv`, csvString);

// }


// dataSources.forEach(source => {
//     let csvString = await fetchCsv(source.url);
//     fs.writeFileSync(`${source.caseType}.csv`, csvString);

// })


////////////////////  download CSV  ////////////////////
// function fetchCsv(url, fileName) {
//     request(url, (err, res, body) => {
//         if (err) { return console.log(err); }
//         return body;
//     })
// }

// fetchCsv(dataSources[0].url);

// dataSources.map(function(source) {
//     const file = fs.createWriteStream(`${source.caseType}.csv`);
//     const request = https.get(source.url, function (response) {
//         response.pipe(file);
//     });
// })


////////////////////  download CSV and convert to 2D array  ////////////////////
// let fileConfirmed = fs.readFileSync("confirmed.csv", {encoding: 'utf8'});
// let result = papa.parse(fileConfirmed, {
//     complete: function(array2D) {
//         console.log(array2D);
//     }
// })


////////////////////  generate data.js  ////////////////////
// let rawData = {};
// let processedData = {};
// function generateDatajs(array2D) {
//     let rawData = {};
//     rawData.time = array2D[0].slice(5);
//     for (let row = 1; row < array2D.length; row++) {
//         let series = {};
//         series.province = array2D[row][0];
//         series.country = array2D[row][1];
//         series.confirmed = array2D[row].slice(5);
//         rawData.case.push(series);
//     }
// }

// .death?
// .recovered?