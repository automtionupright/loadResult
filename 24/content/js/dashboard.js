/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 60.0, "KoPercent": 40.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.36666666666666664, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "BeanShell Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "get-solera-user/lookupkey-0"], "isController": false}, {"data": [0.0, 500, 1500, "external devices"], "isController": false}, {"data": [0.0, 500, 1500, "get-solera-user/lookupkey-1"], "isController": false}, {"data": [0.0, 500, 1500, "get-employer/solera"], "isController": false}, {"data": [0.0, 500, 1500, "check-eligibility"], "isController": false}, {"data": [0.6666666666666666, 500, 1500, "create-order"], "isController": false}, {"data": [0.0, 500, 1500, "Create users"], "isController": false}, {"data": [0.0, 500, 1500, "get-solera-user/lookupkey"], "isController": false}, {"data": [1.0, 500, 1500, "BP"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 30, 12, 40.0, 1362.0333333333333, 4, 13877, 397.0, 4083.600000000003, 9910.949999999995, 13877.0, 1.4201183431952662, 3.0564441568047336, 1.9690273668639053], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["BeanShell Sampler", 3, 0, 0.0, 7.666666666666667, 4, 14, 5.0, 14.0, 14.0, 14.0, 4.601226993865031, 0.0, 0.0], "isController": false}, {"data": ["get-solera-user/lookupkey-0", 3, 0, 0.0, 39.333333333333336, 31, 56, 31.0, 56.0, 56.0, 56.0, 2.0229265003371544, 0.9798550236008091, 0.2983026382333108], "isController": false}, {"data": ["external devices", 3, 3, 100.0, 392.6666666666667, 358, 460, 360.0, 460.0, 460.0, 460.0, 0.2574223442594817, 0.08346115067787883, 0.11035977454093016], "isController": false}, {"data": ["get-solera-user/lookupkey-1", 3, 3, 100.0, 357.6666666666667, 306, 430, 337.0, 430.0, 430.0, 430.0, 1.70261066969353, 8.722554270715097, 0.2494058598183882], "isController": false}, {"data": ["get-employer/solera", 3, 0, 0.0, 2385.6666666666665, 2112, 2901, 2144.0, 2901.0, 2901.0, 2901.0, 0.841514726507714, 6.871822405329594, 0.12655592566619916], "isController": false}, {"data": ["check-eligibility", 3, 0, 0.0, 8252.666666666666, 4215, 13877, 6666.0, 13877.0, 13877.0, 13877.0, 0.19725162732592544, 0.10112998471299889, 0.14832397757906504], "isController": false}, {"data": ["create-order", 3, 0, 0.0, 601.0, 468, 818, 517.0, 818.0, 818.0, 818.0, 0.254000508001016, 0.14684404368808737, 2.734474218948438], "isController": false}, {"data": ["Create users", 3, 3, 100.0, 908.3333333333333, 426, 1708, 591.0, 1708.0, 1708.0, 1708.0, 1.756440281030445, 0.3756449429156909, 1.4013786226580796], "isController": false}, {"data": ["get-solera-user/lookupkey", 3, 3, 100.0, 397.6666666666667, 337, 488, 368.0, 488.0, 488.0, 488.0, 1.6483516483516483, 9.243003090659341, 0.48452524038461536], "isController": false}, {"data": ["BP", 3, 0, 0.0, 277.6666666666667, 227, 320, 286.0, 320.0, 320.0, 320.0, 0.2613240418118467, 0.1339796112804878, 0.10003810975609756], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404/Not Found", 6, 50.0, 20.0], "isController": false}, {"data": ["409/Conflict", 6, 50.0, 20.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 30, 12, "404/Not Found", 6, "409/Conflict", 6, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["external devices", 3, 3, "409/Conflict", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["get-solera-user/lookupkey-1", 3, 3, "404/Not Found", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Create users", 3, 3, "409/Conflict", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["get-solera-user/lookupkey", 3, 3, "404/Not Found", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
