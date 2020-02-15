const dataSources = [{
    caseType: "confirmed",
    url: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv"
}, {
    caseType: "recovered",
    url: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv"
}, {
    caseType: "death",
    url: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv"
}];

/*
    data = {
        dates: [5, 6, 7],
        counts: {
            "cumulative": {
                "Taiwan": {
                    "confirmed": [1, 2, 3]
                }
            }
        }
    } 

    use: 
    let dates = data["dates"] = [...]
    let counts1 = data["regions"]["Taiwan"]["cumulative"]["confirmed"] = [0, 0, 1, 2, 3...]
    let counts2 = data["regions"]["Mainland China"]["new"]["recovered"] = [0, 0, 1, 2, 3...]
    let counts3 = data["regions"]["World"]["cumulative"]["death"] = [0, 0, 1, 2, 3...]
*/

/*
    data = {
        dates: [5, 6, 7],
        allCounts: [
            {
                "region": "Taiwan",
                "mode": "cumulative",
                "caseType": "confirmed",
                "counts": [0, 0, 1, 2, 3...]
            }
        ]
    }

    use:
    let dates = data.dates
    let counts = data.allCounts.filter(el => el.region == "Taiwan" && el.mode == "cumulative" && el.caseType == "confirmed")[0].counts
    let counts = getCounts("Taiwan", "cumulative", "confirmed")
*/

interface Counts {
    region: string;
    mode:string;
    caseType: string;
    counts: number[];
}

class Data {
    dates: string[];
    allCounts: Counts[];

    constructor() {
        this.dates = [];
        this.allCounts = [];
    }

    getCounts(region: string, mode: string, caseType: string): number[] {
        return this.allCounts.filter(el => el.region == region && el.mode == mode && el.caseType == caseType)[0].counts;
    }

    addCounts(region: string, mode: string, caseType: string, counts:number[]): void {
        let searchResult = this.allCounts.filter(el => el.region == region && el.mode == mode && el.caseType == caseType);
        if (searchResult.length === 0) {
            this.allCounts.push({
                "region": region,
                "mode": mode,
                "caseType": caseType,
                "counts": counts.slice()  // make a copy! We'll add to this count later -- don't want that to mess with the counts that was passed in!
            });
        } else {
            let currentCounts = searchResult[0].counts;
            for (let i = 0; i < currentCounts.length; i++) {
                currentCounts[i] += counts[i];
            }
        }
    }
}

let data = new Data();

(function() {
    for (let i = 0; i < dataSources.length; i++) {
        let csv: string = getCsv(dataSources[i].url);
        let table: string[][] = convertTo2DArray(csv);

        data.dates = extractDates(table);
        data.dates = data.dates.map(el => convertToIsoDate(el));  // comment out if you don't want ISO dates

        let rows: string[][] = table.slice(1); // remove the header row

        rows.forEach((row: string[]) => {
            let province: string = getProvince(row);
            let country: string = getCountry(row);
            let counts: number[] = getCumulativeCaseCounts(row);

            data.addCounts("World", "cumulative", dataSources[i].caseType, counts);
            data.addCounts(country, "cumulative", dataSources[i].caseType, counts);
            if (province != "" && province != country) {
                data.addCounts(province, "cumulative", dataSources[i].caseType, counts);
            }
        })
    }
})();

// TODO: getCsv()
function getCsv(url: string): string {
    let csv: string = 
`Province/State,Country/Region,Lat,Long,1/22/20,1/23/20,1/24/20,1/25/20,1/26/20,1/27/20,1/28/20,1/29/20,1/30/20,1/31/20,2/1/20,2/2/20,2/3/20,2/4/20,2/5/20,2/6/20,2/7/20,2/8/20,2/9/20,2/10/20,2/11/20,2/12/20,2/13/20,2/14/20
Anhui,Mainland China,31.82571,117.2264,0,0,0,0,0,0,0,2,2,3,5,7,14,20,23,34,47,59,72,88,105,127,157,193
Beijing,Mainland China,40.18238,116.4142,0,0,1,2,2,2,4,4,4,5,9,9,12,23,24,31,33,34,37,44,48,56,69,80
Chongqing,Mainland China,30.05718,107.874,0,0,0,0,0,0,0,1,1,1,3,7,9,9,15,24,31,39,51,66,79,102,128,152
Fujian,Mainland China,26.07783,117.9895,0,0,0,0,0,0,0,0,0,0,0,0,1,3,11,14,20,24,35,39,45,53,57,63
Gansu,Mainland China,36.0611,103.8343,0,0,0,0,0,0,0,0,0,0,0,3,3,4,6,6,9,12,16,17,24,31,39,39
Guangdong,Mainland China,23.33841,113.422,0,2,2,2,2,4,4,5,10,11,14,15,21,30,49,69,88,112,141,167,212,275,314,362
Guangxi,Mainland China,23.82908,108.7881,0,0,0,0,0,0,2,2,2,2,2,2,7,10,13,14,17,17,18,24,33,32,33,36
Guizhou,Mainland China,26.81536,106.8748,0,0,0,0,0,0,0,1,1,2,2,2,2,2,9,6,6,7,7,10,17,18,27,28
Hainan,Mainland China,19.19673,109.7455,0,0,0,0,0,0,0,0,1,1,1,4,4,5,5,8,10,14,19,19,20,27,30,43
Hebei,Mainland China,38.0428,114.5149,0,0,0,0,0,0,0,0,0,0,0,3,3,4,6,13,22,30,34,41,48,54,68,87
Heilongjiang,Mainland China,47.862,127.7622,0,0,0,0,0,0,0,0,0,0,2,2,2,4,7,8,12,13,14,30,28,31,33,47
Henan,Mainland China,33.88202,113.614,0,0,0,0,0,0,0,1,2,3,3,10,16,27,47,56,86,116,153,191,218,246,296,357
Hubei,Mainland China,30.97564,112.2707,28,28,31,32,42,45,80,88,90,141,168,295,386,522,633,817,1115,1439,1795,2222,2639,2686,3459,4774
Hunan,Mainland China,27.61041,111.7088,0,0,0,0,0,0,0,0,2,2,8,16,22,31,54,81,112,156,186,208,247,304,339,364
Inner Mongolia,Mainland China,44.09448,113.9456,0,0,0,0,0,0,0,0,0,1,1,1,1,1,3,4,5,5,5,5,5,6,6,6
Jiangsu,Mainland China,32.97027,119.464,0,0,0,1,1,1,1,1,1,5,6,7,8,12,23,34,43,51,71,81,93,125,139,157
Jiangxi,Mainland China,27.61401,115.7221,0,0,0,0,0,2,3,3,5,7,9,12,18,20,27,37,45,55,73,105,128,152,170,187
Jilin,Mainland China,43.66657,126.1917,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2,4,4,4,12,13,18,22,24,25
Liaoning,Mainland China,41.29284,122.6086,0,0,0,0,0,0,0,1,1,1,1,1,1,2,4,5,7,8,12,13,19,20,22,29
Ningxia,Mainland China,37.26923,106.1655,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,5,15,13,13,22,24,24,24
Qinghai,Mainland China,35.65945,96.02564,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,5,9,11,11
Shaanxi,Mainland China,35.19165,108.8701,0,0,0,0,0,0,0,0,0,0,0,0,0,2,6,9,17,20,25,30,32,43,46,54
Shandong,Mainland China,36.34377,118.1529,0,0,0,0,0,0,0,1,1,2,3,6,7,11,15,27,37,44,63,66,80,92,105,136
Shanghai,Mainland China,31.20327,121.4554,0,0,1,1,1,3,4,5,5,9,10,10,10,12,15,25,30,41,44,48,52,57,62,90
Shanxi,Mainland China,37.57769,112.2922,0,0,0,0,0,0,0,1,1,1,1,3,2,4,5,12,15,21,25,25,30,33,36,38
Sichuan,Mainland China,30.61714,102.7103,0,0,0,0,0,0,0,1,1,1,3,11,14,14,24,31,42,60,71,80,85,92,104,114
Tianjin,Mainland China,39.29362,117.333,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,2,2,4,4,8,10,11,21,31
Tibet,Mainland China,30.1534,88.7879,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1
Xinjiang,Mainland China,41.11981,85.17822,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,6,6
Yunnan,Mainland China,24.97411,101.4868,0,0,0,0,0,0,0,0,0,1,2,3,5,5,5,7,12,17,18,19,20,26,27,36
Zhejiang,Mainland China,29.18251,120.0985,0,0,1,1,1,1,3,3,4,14,21,32,43,62,78,94,123,175,201,242,270,321,360,403
,Thailand,13.7563,100.5018,0,0,0,0,2,2,5,5,5,5,5,5,5,5,5,5,5,10,10,10,10,10,12,12
,Japan,35.6762,139.6503,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,9,9,9,9
,South Korea,37.5665,126.978,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,3,3,3,7,7,7
Taiwan,Taiwan,23.6978,120.9605,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,2
"Seattle, WA",US,47.7511,-120.74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1
"Chicago, IL",US,40.6331,-89.3985,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2
"Tempe, AZ",US,34.0489,-111.094,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
Macau,Macau,22.1987,113.5439,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2,3,3
Hong Kong,Hong Kong,22.3193,114.1694,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1
,Singapore,1.3521,103.8198,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,9,15,15,17
,Vietnam,21.0278,105.8342,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,6,6,7,7
,France,46.2276,2.2137,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2
,Nepal,28.3949,84.124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1
,Malaysia,4.2105,101.9758,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,3,3,3,3
"Toronto, ON",Canada,43.6532,-79.3832,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
British Columbia,Canada,49.2827,-123.121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
"Orange, CA",US,33.7879,-117.8531,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
"Los Angeles, CA",US,34.0522,-118.2437,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
New South Wales,Australia,-33.8688,151.2093,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4
Victoria,Australia,-37.8136,144.9631,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4
Queensland,Australia,-27.4698,153.0251,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
,Cambodia,12.5657,104.991,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1
,Sri Lanka,7.8731,80.7718,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1
,Germany,51.1657,10.4515,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1
,Finland,61.9241,25.7482,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1
,United Arab Emirates,23.4241,53.8478,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1
,Philippines,12.8797,121.774,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1
,India,20.5937,78.9629,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
"London, ON",Canada,42.9849,-81.2453,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1
,Italy,41.8719,12.5674,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
,UK,55.3781,-3.436,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1
,Russia,61.524,105.3188,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2
,Sweden,60.1282,18.6435,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
"Santa Clara, CA",US,37.3541,-121.9552,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
,Spain,40.4637,-3.7492,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
South Australia,Australia,-34.9285,138.6007,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
"Boston, MA",US,42.3601,-71.0589,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
"San Benito, CA",US,36.5761,-120.9876,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
,Belgium,50.5039,4.4699,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
"Madison, WI",US,43.0731,-89.4012,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
Diamond Princess cruise ship,Others,35.4437,129.638,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
"San Diego County, CA",US,32.7157,-117.1611,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
"San Antonio, TX",US,29.4241,-98.4936,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
,Egypt,26.8206,30.8025,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0`;
    return csv;
}


// TODO: convertTo2DArray()
function convertTo2DArray(csv: string): string[][] {
    let table: string[][] = Papa.parse(csv).data;
    // let table: string[][];
    // let rows = csv.split("\n");
    // table = rows.map(row => row.split(","));
    return table;
}

function extractDates(table: string[][]): string[] {
    return table[0].slice(4);
}

function convertToIsoDate(dateInput: string): string {
    //example input: 1/24/20                    // in UTC
    //example output: 2020-01-24T17:00:00.000Z  // in UTC
    let results: string[] = dateInput.match(/^(\d+)\/(\d+)\/(\d+)$/);
    let month: string = results[1];
    let day: string = results[2];
    let year: string = results[3];
    let date = new Date();
    date.setUTCMonth(parseInt(month) - 1); // JS Date() months range from 0 to 11
    date.setUTCDate(parseInt(day));
    date.setUTCFullYear(parseInt("20" + year));
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date.toISOString();
}

function sum(array1: number[], array2: number[]): number[] {
    if (array1 === undefined && array2 === undefined) {
        throw new Error("Cannot sum 2 undefined arrays.")
    } else if (array1 === undefined) {
        return array2;
    } else if (array2 === undefined) {
        return array1;
    } else {
        return array1.map((value, index) => value + array2[index]);
    }
}


function getProvince(row: string[]): string {
    return row[0];
}

function getCountry(row: string[]): string {
    return row[1];
}

function getLatitude(row: string[]): number {
    return parseFloat(row[2]);
}

function getLongitude(row: string[]): number {
    return parseFloat(row[3]);
}

function getCumulativeCaseCounts(row: string[]): number[] {
    let cumulativeCaseCounts = row.slice(4);
    return cumulativeCaseCounts.map(el => el === "" ? 0 : parseFloat(el));
} 