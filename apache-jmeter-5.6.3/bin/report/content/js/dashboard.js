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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8666666666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "https://payment.hotmart.com/R54638781B?checkoutMode=10&_hi=eyJjaWQiOiIxNzM4NjAyMjE1NTAzNzU3MzQ4Mzc1NzY3Mjk2ODAwIiwiYmlkIjoiMTczODYwMjIxNTUwMzc1NzM0ODM3NTc2NzI5NjgwMCIsInNpZCI6Ijc5ZjUxNzk2OTk1YjQ1ZjZhYmZmZWRiYjZjYjA0YzNhIn0=.1738605778701-0"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "https://payment.hotmart.com/R54638781B?checkoutMode=10&_hi=eyJjaWQiOiIxNzM4NjAyMjE1NTAzNzU3MzQ4Mzc1NzY3Mjk2ODAwIiwiYmlkIjoiMTczODYwMjIxNTUwMzc1NzM0ODM3NTc2NzI5NjgwMCIsInNpZCI6Ijc5ZjUxNzk2OTk1YjQ1ZjZhYmZmZWRiYjZjYjA0YzNhIn0=.1738605778701-1"], "isController": false}, {"data": [0.75, 500, 1500, "Test"], "isController": true}, {"data": [1.0, 500, 1500, "https://gitgithub.andreregino.com.br/"], "isController": false}, {"data": [0.75, 500, 1500, "https://payment.hotmart.com/R54638781B?checkoutMode=10&_hi=eyJjaWQiOiIxNzM4NjAyMjE1NTAzNzU3MzQ4Mzc1NzY3Mjk2ODAwIiwiYmlkIjoiMTczODYwMjIxNTUwMzc1NzM0ODM3NTc2NzI5NjgwMCIsInNpZCI6Ijc5ZjUxNzk2OTk1YjQ1ZjZhYmZmZWRiYjZjYjA0YzNhIn0=.1738605778701"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 24, 0, 0.0, 333.87500000000006, 33, 1273, 165.0, 1018.5, 1231.5, 1273.0, 1.094391244870041, 157.273052753078, 0.8913303693570451], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://payment.hotmart.com/R54638781B?checkoutMode=10&_hi=eyJjaWQiOiIxNzM4NjAyMjE1NTAzNzU3MzQ4Mzc1NzY3Mjk2ODAwIiwiYmlkIjoiMTczODYwMjIxNTUwMzc1NzM0ODM3NTc2NzI5NjgwMCIsInNpZCI6Ijc5ZjUxNzk2OTk1YjQ1ZjZhYmZmZWRiYjZjYjA0YzNhIn0=.1738605778701-0", 6, 0, 0.0, 234.66666666666666, 156, 380, 165.0, 380.0, 380.0, 380.0, 0.31028598024512594, 0.17271778197238455, 0.21513969333402286], "isController": false}, {"data": ["https://payment.hotmart.com/R54638781B?checkoutMode=10&_hi=eyJjaWQiOiIxNzM4NjAyMjE1NTAzNzU3MzQ4Mzc1NzY3Mjk2ODAwIiwiYmlkIjoiMTczODYwMjIxNTUwMzc1NzM0ODM3NTc2NzI5NjgwMCIsInNpZCI6Ijc5ZjUxNzk2OTk1YjQ1ZjZhYmZmZWRiYjZjYjA0YzNhIn0=.1738605778701-1", 6, 0, 0.0, 411.83333333333337, 47, 1107, 252.5, 1107.0, 1107.0, 1107.0, 0.3089598352214212, 84.96546327883624, 0.21240988671472708], "isController": false}, {"data": ["Test", 6, 0, 0.0, 689.0, 254, 1318, 561.0, 1318.0, 1318.0, 1318.0, 0.3024955886059995, 90.52830381900681, 0.5677700403327451], "isController": true}, {"data": ["https://gitgithub.andreregino.com.br/", 6, 0, 0.0, 41.333333333333336, 33, 50, 42.0, 50.0, 50.0, 50.0, 0.3122235520632773, 7.402808223187803, 0.15489215278139148], "isController": false}, {"data": ["https://payment.hotmart.com/R54638781B?checkoutMode=10&_hi=eyJjaWQiOiIxNzM4NjAyMjE1NTAzNzU3MzQ4Mzc1NzY3Mjk2ODAwIiwiYmlkIjoiMTczODYwMjIxNTUwMzc1NzM0ODM3NTc2NzI5NjgwMCIsInNpZCI6Ijc5ZjUxNzk2OTk1YjQ1ZjZhYmZmZWRiYjZjYjA0YzNhIn0=.1738605778701", 6, 0, 0.0, 647.6666666666667, 213, 1273, 522.0, 1273.0, 1273.0, 1273.0, 0.3030149992424625, 83.49927481566588, 0.41842110246957226], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 24, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
