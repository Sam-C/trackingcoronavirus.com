const dataSources = [{
    caseType: "confirmed",
    url: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/time_series/time_series_2019-ncov-Confirmed.csv",
    gmt: -5
}, {
    caseType: "recovered",
    url: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/time_series/time_series_2019-ncov-Recovered.csv",
    gmt: -5
}, {
    caseType: "death",
    url: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/time_series/time_series_2019-ncov-Deaths.csv",
    gmt: -5
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
        data.dates = data.dates.map(el => convertToIsoDate(el, dataSources[i].gmt));  // comment out if you don't want ISO dates

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
`Province/State,Country/Region,Lat,Long,1/21/20 22:00,1/22/20 12:00,1/23/20 12:00,1/24/20 0:00,1/24/20 12:00,1/25/20 0:00,1/25/20 12:00,1/25/20 22:00,1/26/20 11:00,1/26/20 23:00,1/27/20 9:00,1/27/20 19:00,1/27/20 20:30,1/28/20 13:00,1/28/20 18:00,1/28/20 23:00,1/29/20 13:30,1/29/20 14:30,1/29/20 21:00,1/30/20 11:00,1/31/20 14:00,2/1/20 10:00,2/2/20 21:00,2/3/20 21:00,2/4/20 9:40,2/4/20 22:00,2/5/20 9:00,2/5/20 23:00,2/6/20 9:00,2/6/20 14:20,2/7/20 20:13,2/7/20 22:50,2/8/20 10:24,2/8/20 23:04,2/9/20 10:30,2/9/20 23:20,2/10/20 10:30,2/10/20 19:30,2/11/20 10:50,2/11/20 20:44,2/12/20 10:20,2/12/20 22:00,2/13/20 10:00,2/13/20 21:15
Anhui,Mainland China,31.82571,117.2264,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,1,1,3,3,3,4,4,4,5,5,6
Beijing,Mainland China,40.18238,116.4142,,,,,,,,,,,,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,3,3,3,3,3,3
Chongqing,Mainland China,30.05718,107.874,,,,,,,,,,,,,,,,,,,,,,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,4
Fujian,Mainland China,26.07783,117.9895,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Gansu,Mainland China,36.0611,103.8343,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,1,1,1,1,2,2,2,2,2,2,2,2,2
Guangdong,Mainland China,23.33841,113.422,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,1,1,1,1,1,1,1,1,1,1,1,2,2,2
Guangxi,Mainland China,23.82908,108.7881,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,1,1,1,1,1,1,1,1,2,2,2
Guizhou,Mainland China,26.81536,106.8748,,,,,,,,,,,,,,,,,,,,,,,,,,,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
Hainan,Mainland China,19.19673,109.7455,,,,,,,,,,,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,3,3,3,3,3,3,3,4,4,4
Hebei,Mainland China,38.0428,114.5149,,,,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,3
Heilongjiang,Mainland China,47.862,127.7622,,,,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,3,3,5,5,6,6,7,7,7,8,8,8,9,9,11
Henan,Mainland China,33.88202,113.614,,,,,,,,,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,4,4,6,6,6,6,6,7,8,8,10,10,11
Hubei,Mainland China,30.97564,112.2707,,,,24,24,32,40,52,52,76,76,76,100,100,125,125,125,125,162,162,204,249,350,414,414,479,479,549,549,549,618,699,699,780,780,871,871,974,974,1068,1068,1310,1310,1426
Hunan,Mainland China,27.61041,111.7088,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,1,1,1,1,1,1,1,2,2,2,2,2
Inner Mongolia,Mainland China,44.09448,113.9456,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Jiangsu,Mainland China,32.97027,119.464,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Jiangxi,Mainland China,27.61401,115.7221,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,1,1,1,1,1,1,1,1,1
Jilin,Mainland China,43.66657,126.1917,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,1,1,1,1,1,1,1,1,1,1,1,1,1,1
Liaoning,Mainland China,41.29284,122.6086,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,1,1,1,1
Ningxia,Mainland China,37.26923,106.1655,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Qinghai,Mainland China,35.65945,96.02564,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Shaanxi,Mainland China,35.19165,108.8701,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Shandong,Mainland China,36.34377,118.1529,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,1,1,1,1,1,1,1,2,2,2,2
Shanghai,Mainland China,31.20327,121.4554,,,,,,,,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
Shanxi,Mainland China,37.57769,112.2922,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Sichuan,Mainland China,30.61714,102.7103,,,,,,,,,,,,,,,,,,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
Tianjin,Mainland China,39.29362,117.333,,,,,,,,,,,,,,,,,,,,,,,,,,,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,3,3
Tibet,Mainland China,30.1534,88.7879,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Xinjiang,Mainland China,41.11981,85.17822,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,1,1,1
Yunnan,Mainland China,24.97411,101.4868,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Zhejiang,Mainland China,29.18251,120.0985,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Hong Kong,Hong Kong,22.3193,114.1694,,,,,,,,,,,,,,,,,,,,,,,,,,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
Macau,Macau,22.1987,113.5439,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Taiwan,Taiwan,23.6978,120.9605,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"Seattle, WA",US,47.7511,-120.74,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"Chicago, IL",US,40.6331,-89.3985,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"Tempe, AZ",US,34.0489,-111.094,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Japan,35.6762,139.6503,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,1,1
,Thailand,13.7563,100.5018,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,South Korea,37.5665,126.978,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Singapore,1.3521,103.8198,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Vietnam,21.0278,105.8342,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,France,46.2276,2.2137,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Nepal,28.3949,84.124,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Malaysia,4.2105,101.9758,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"Toronto, ON",Canada,43.6532,-79.3832,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
British Columbia,Canada,49.2827,-123.121,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"Orange, CA",US,33.7879,-117.8531,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"Los Angeles, CA",US,34.0522,-118.2437,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
New South Wales,Australia,-33.8688,151.2093,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Victoria,Australia,-37.8136,144.9631,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Queensland,Australia,-27.4698,153.0251,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Cambodia,12.5657,104.991,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Sri Lanka,7.8731,80.7718,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Germany,51.1657,10.4515,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Finland,61.9241,25.7482,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,United Arab Emirates,23.4241,53.8478,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Philippines,12.8797,121.774,,,,,,,,,,,,,,,,,,,,,,,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
,India,20.5937,78.9629,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"London, ON",Canada,42.9849,-81.2453,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Italy,41.8719,12.5674,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,UK,55.3781,-3.436,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Russia,61.524,105.3188,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Sweden,60.1282,18.6435,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"Santa Clara, CA",US,37.3541,-121.9552,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Spain,40.4637,-3.7492,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
South Australia,Australia,-34.9285,138.6007,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"Boston, MA",US,42.3601,-71.0589,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"San Benito, CA",US,36.5761,-120.9876,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
,Belgium,50.5039,4.4699,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"Madison, WI",US,43.0731,-89.4012,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
Diamond Princess cruise ship,Others,35.4437,129.638,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0,0,0,0,0,0,0
"San Diego County, CA",US,32.7157,-117.1611,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,0,0,0,0,0
"San Antonio, TX",US,29.4241,-98.4936,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0`;
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

function convertToIsoDate(dateInput: string, gmt: number): string {
    //example input: 1/24/20 12:00              // in US Eastern Time (GMT -5)
    //example output: 2020-01-24T17:00:00.000Z  // in UTC
    let results: string[] = dateInput.match(/^(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)$/);
    let month: string = results[1];
    let day: string = results[2];
    let year: string = results[3];
    let hour: string = results[4];
    let minute: string = results[5];
    let date = new Date();
    date.setUTCMonth(parseInt(month) - 1); // JS Date() months range from 0 to 11
    date.setUTCDate(parseInt(day));
    date.setUTCFullYear(parseInt("20" + year));
    date.setUTCHours(parseInt(hour));
    date.setUTCMinutes(parseInt(minute));
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    date.setTime(date.getTime() - (gmt*60*60*1000)); // back-convert from GMT-5 to GMT0
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