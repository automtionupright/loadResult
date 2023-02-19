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

    var data = {"OkPercent": 84.61538461538461, "KoPercent": 15.384615384615385};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4230769230769231, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "BeanShell Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "get-solera-user/lookupkey-0"], "isController": false}, {"data": [0.0, 500, 1500, "external devices"], "isController": false}, {"data": [0.0, 500, 1500, "get-solera-user/lookupkey-1"], "isController": false}, {"data": [0.0, 500, 1500, "get-employer/solera"], "isController": false}, {"data": [0.0, 500, 1500, "check-eligibility"], "isController": false}, {"data": [1.0, 500, 1500, "create-order"], "isController": false}, {"data": [0.0, 500, 1500, "Create users"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "get-solera-user/lookupkey"], "isController": false}, {"data": [1.0, 500, 1500, "BP"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 26, 4, 15.384615384615385, 2992.961538461538, 3, 14826, 518.5, 13314.100000000002, 14756.699999999999, 14826.0, 0.8868574547191049, 1.546837425810963, 1.4015705478050278], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["BeanShell Sampler", 3, 0, 0.0, 8.0, 3, 17, 4.0, 17.0, 17.0, 17.0, 4.665629860031105, 0.0, 0.0], "isController": false}, {"data": ["get-solera-user/lookupkey-0", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 16.145833333333336, 4.915364583333334], "isController": false}, {"data": ["external devices", 3, 1, 33.333333333333336, 4161.0, 86, 6267, 6130.0, 6267.0, 6267.0, 6267.0, 0.39401103230890466, 0.16930161544523248, 0.1689168390464933], "isController": false}, {"data": ["get-solera-user/lookupkey-1", 1, 1, 100.0, 63.0, 63, 63, 63.0, 63.0, 63.0, 63.0, 15.873015873015872, 81.31820436507937, 2.3251488095238093], "isController": false}, {"data": ["get-employer/solera", 3, 0, 0.0, 2585.0, 2504, 2739, 2512.0, 2739.0, 2739.0, 2739.0, 0.9466708740927738, 7.730529149573998, 0.14237042442410855], "isController": false}, {"data": ["check-eligibility", 3, 0, 0.0, 14068.333333333334, 12751, 14826, 14628.0, 14826.0, 14826.0, 14826.0, 0.19647652105573382, 0.16174776098631213, 0.15592765570764294], "isController": false}, {"data": ["create-order", 3, 0, 0.0, 343.6666666666667, 238, 422, 371.0, 422.0, 422.0, 422.0, 1.5739769150052467, 0.9099554039874083, 17.01042759706191], "isController": false}, {"data": ["Create users", 3, 1, 33.333333333333336, 4162.333333333333, 3987, 4435, 4065.0, 4435.0, 4435.0, 4435.0, 0.6648936170212766, 0.1460947888962766, 0.5304864112367021], "isController": false}, {"data": ["get-solera-user/lookupkey", 3, 1, 33.333333333333336, 449.6666666666667, 94, 640, 615.0, 640.0, 640.0, 640.0, 2.8708133971291865, 7.227497009569379, 0.6233178827751197], "isController": false}, {"data": ["BP", 3, 0, 0.0, 130.0, 81, 223, 86.0, 223.0, 223.0, 223.0, 0.45187528242205155, 0.23167433913239946, 0.18239757493598432], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404/Not Found", 2, 50.0, 7.6923076923076925], "isController": false}, {"data": ["409/Conflict", 2, 50.0, 7.6923076923076925], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 26, 4, "404/Not Found", 2, "409/Conflict", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["external devices", 3, 1, "409/Conflict", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["get-solera-user/lookupkey-1", 1, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Create users", 3, 1, "409/Conflict", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["get-solera-user/lookupkey", 3, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
