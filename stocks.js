"use strict";

var version = 1.6;

function stockDate(ticker, date, open, high, low, close, volume) {
    this.ticker = ticker;
    this.date = date;
    this.open = open;
    this.high = high;
    this.low = low;
    this.close = close;
    this.volume = volume;
}

function tickerFailedProcess() {
    this.ticker = "";
    this.count = 0;
}

function tickerFailedProcessList() {
    
    this.tickerList = [];
    this.tickerCount = -1;

    this.add = function(ticker) {

        var foundPos = 0;

        foundPos = this.find(ticker);

        if (foundPos < 0) {
            foundPos = ++this.tickerCount;
            this.tickerList[foundPos] = new tickerFailedProcess();
        }
        
        this.tickerList[foundPos].ticker = ticker;
        ++this.tickerList[foundPos].count;
        
    };

    this.count = function(ticker) {

        var foundPos = 0;

        foundPos = this.find(ticker);

        if (foundPos >= 0) {
            return this.tickerList[foundPos].count;
        }
        else {
            return 0;
        }
        
    };

    this.find = function(ticker) {

        var i = 0;
        
        for (i = 0; i < this.tickerList.length; i++) {
            if (this.tickerList[i].ticker === ticker) {
                return i;
            }
        }

        return -1;

    };

    this.reset = function() {
        this.tickerList = [];
        this.tickerCount = -1;
    };

}

var stockConstants = {range: 20, baseATR: 0.1, rsiX: 6, divergX: 9, riskATR: 2.0, rewardATR: 1.4, dateRange: 30};
var globalVars = {latestDate: [], useTable: true, showInfo: true, singleRow: false};
var tickerFailedProcesses = new tickerFailedProcessList();

function stockDates() {

    this.stockDatesList = [];
    this.arrayPos = 0;
    this.processed = 0;

    this.addStockDate = function(stockDate) {
        this.stockDatesList[this.arrayPos] = stockDate;
        ++this.arrayPos;
    };

    this.getTickerList = function(ticker) {
        
        var newTickerList = [];
        var newArrayPos = 0;
        var i = 0;
        
        for (i = 0; i < this.stockDatesList.length; i++) {
            if (this.stockDatesList[i].ticker === ticker) {
                newTickerList[newArrayPos] = this.stockDatesList[i];
                ++newArrayPos;
            }
        }

        return newTickerList;
        
    };

    this.deleteTicker = function(ticker) {
        
        var i = 0;
        
        for (i = 0; i < this.stockDatesList.length; i++) {
            if (this.stockDatesList[i].ticker === ticker) {
                delete this.stockDatesList[i];
            }
        }

        return;
    };

    this.getTickerDesc = function(ticker) {

        var desc= "";
        var i = 0;
        
        for (i = 0; i < tickers.length; i++) {
            if (tickers[i].ticker === ticker) {
                desc = tickers[i].desc;
            }
        }

        return desc;
    };

    this.getTickerPos = function(ticker) {

        var found = false;
        var i = 0;
        var foundPos = -1;
        
        for (i = 0; i < tickers.length; i++) {
            if (tickers[i].ticker === ticker) {
                found = true;
                break;
            }
        }

        if (found) {
            foundPos = i;
        }

        return foundPos;
    };

    this.fillFromCSV = function(ticker, csvData) {
        // Fill the stock dates list from CSV data

        var i = 0; // Loop array elements
        var column = 0; // Column position
        var columns = []; // Columns array
        var rowData = []; // Row data
        var stockDate = {}; // Stock date object

        for (i = 0; i < csvData.length; i++) {

            rowData = csvData[i];

            if (rowData[0] === "") {
                // Ignore blank CSV rows
                continue;
            }

            if (i === 0) {
                // Columns headers
                columns = rowData;
                continue;
            }

            stockDate = {ticker: ticker};

            for (column = 0; column < rowData.length; column++) {

                // Add to the stock date instance for the property based on the columns
                // Columns can then be added to the cvs and automatically appear in the object
                stockDate[columns[column].toLowerCase()] = rowData[column];
                
            } 

            this.addStockDate(stockDate);

        }

    };

    this.fillFromJSON = function(ticker, jsonData) {
        // Fill the stock dates list from CSV data

        var i = 0; // Loop array elements
        var rowData = []; // Row data
        var stockDate = {}; // Stock date object

        for (i = 0; i < jsonData.length; i++) {

            rowData = jsonData[i];

            if (rowData[0] === "") {
                // Ignore blank CSV rows
                continue;
            }

            stockDate = {ticker: ticker};
            stockDate.open = rowData.Open;
            stockDate.close = rowData.Close;
            stockDate.date = convertDate(rowData.Date);
            stockDate.high = rowData.High;
            stockDate.low = rowData.Low;
            stockDate.volume = rowData.Volume;

            this.addStockDate(stockDate);

        }

        return;

        function convertDate(date) {

            var newDateFormat = "";
            var month ="";
            var splitDate = "";
            var dateFormat = new Date(date);

            try {
                splitDate = date.split("-");
            }
            catch (err) {
                return newDateFormat;
            }

            // 11-Nov-16 from 2016-11-11
            month = dateFormat.toDateString().substr(4,3);

            newDateFormat = splitDate[2] + "-";
            newDateFormat = newDateFormat + month + "-";
            newDateFormat = newDateFormat + splitDate[0].substr(2, 2);

            return newDateFormat;

        }

    };

}

function technical(ticker) {
    this.ticker = ticker;
    this.close = [];
    this.desc =  [];
    this.high = [];
    this.low = [];
    this.gain = [];
    this.loss = [];
    this.gainVal = 0;
    this.lossVal = 0;
    this.atrVal = 0;
    this.direction = 0;
    this.date = [];
    this.tr = [];
    this.atr = [];
    this.rsi = [];

    this.fillFromStockDates = function(ticker, allStockDates) {

        var tickerList = [];
        // var newTechnical = new technical(ticker);
        var frame2 = 0;
        var firstRow = true;
        var firstFrame = true;
        var change = 0;
        var i = 0;
        var open = 0;
        var close = 0;
        var high = 0;
        var low = 0;
        var checkDateString = "";
        var checkDate = new Date();
        var latestDate = new Date();
        var tickerPos = 0;
        
        this.ticker = ticker;

        // Get array of tickers
        tickerList = allStockDates.getTickerList(ticker);
        tickerPos = allStockDates.getTickerPos(ticker);

        frame2 = tickerList.length - 40;
        
        // frame1
        i = tickerList.length - 1;
        
        while (true) {

            if (i < 0 ) {
                break;
            }

            try {
                open = Number(tickerList[i].open).toFixed(1);
            }
            catch (err) {
                open = 0;
            }
            try {
                close = Number(tickerList[i].close).toFixed(1);
            }
            catch (err) {
                close = 0;
            }

            if (firstRow) {
                if (open === 0) {
                    open = close;
                }
                change = 0;
            }
            else {
                if (open === 0) {
                    open = Number(tickerList[i + 1].close).toFixed(1); 
                }
                change = close - Number(tickerList[i + 1].close).toFixed(1);
            }

            high = Number(tickerList[i].high).toFixed(1);
            low = Number(tickerList[i].low).toFixed(1);

            this.date[i] = tickerList[i].date;
            this.close[i] = Number(close);
            this.high[i] = Number(high);
            this.low[i] = Number(low);
            this.desc[i] = tickerList[i].desc;

            if (tickerPos >= 0) { 
                checkDateString = stockDateToDate(this.date[i]);
                checkDate = new Date(checkDateString);
                if (globalVars.latestDate[tickerPos] === undefined) {
                    latestDate = new Date(globalVars.latestDate[tickerPos]);
                } 
                else { 
                    latestDate = new Date(globalVars.latestDate[tickerPos].date);
                }
                if (globalVars.latestDate[tickerPos] === "" || globalVars.latestDate[tickerPos] === undefined || checkDate > latestDate) {
                    globalVars.latestDate[tickerPos] = {date: checkDateString, ticker: ticker};
                }
            }

            if (change > 0) {
                this.gain[i] = change;
            }
            else {
                this.gain[i] = 0;
            }

            if (change < 0) {
                this.loss[i] = -change;
            }
            else {
                this.loss[i] = 0;
            }

            if (firstRow) {
                this.tr[i] = high - low;
            }
            else {
                this.tr[i] = Math.max(high - low, Math.abs(high - Number(tickerList[i + 1].close).toFixed(1)), Math.abs(low - Number(tickerList[i + 1].close).toFixed(1)));
            }

            firstRow = false;

            i--;

            if (i >= frame2) {
                continue;
            }
            technicals2(this, tickerList, firstFrame);

            firstFrame = false;
            frame2--;

            if (frame2 < 0) {
                break;
            } 

        }  

        return; // End of technicals

        function technicals2(newTechnical, tickerList, firstFrame) {

            var rs = 0.0;
            var i = 0;
            var position = 0;

            if (firstFrame) {
                
                for (i = 27; i >= 14; i--) {

                    position = frame(i);

                    newTechnical.gainVal += newTechnical.gain[position];
                    newTechnical.lossVal += newTechnical.loss[position];
                    newTechnical.atrVal += newTechnical.tr[position];
                }
                newTechnical.gainVal /= 14;
                newTechnical.lossVal /= 14;
                newTechnical.atrVal /= 14;

                for (i = 13; i >= 1; i--) {
                    technicals3(i);
                }

            }
            else {

                technicals3(1);

            }

            if (newTechnical.lossVal > 0) {
                rs = newTechnical.gainVal / newTechnical.lossVal;
            }
            else {
                rs = 0;
            }

            position = frame(1);

            newTechnical.rsi[position] = (100 - (100 / (1 + rs))).toFixed(1);
            newTechnical.atr[position] = newTechnical.atrVal.toFixed(1);

            return; // End of technicals 2

            function technicals3(frameNumber) {

                var position = frame(frameNumber);

                newTechnical.gainVal = (newTechnical.gainVal * 13 + newTechnical.gain[position]) / 14;
                newTechnical.lossVal = (newTechnical.lossVal * 13 + newTechnical.loss[position]) / 14;
                newTechnical.atrVal = (newTechnical.atrVal * 13 + newTechnical.tr[position]) / 14;

            }

        }

        function frame(frameNumber) {
            return frame2 + frameNumber - 1;
        }
    };
};

function trade(ticker) {
    this.ticker = ticker;
    this.desc = "";
    this.date = "";
    this.riskPercent = 0;
    this.atr = 0;
    this.close = 0;
    this.size = 0;
    this.stopPA = 0;
    this.stopAT = 0;
    this.limitPA = 0;
    this.limitAT = 0;
    this.sortDate = 0;
};

function trades() {
        
    this.tradesList = [];
    this.arrayPos = 0;
    
    this.reset = function(){
        this.tradesList = [];
        this.arrayPos = 0;
    };

    this.addTrade = function(trade) {
        this.tradesList[this.arrayPos] = trade;
        ++this.arrayPos;
        // Sort into date order
        this.tradesList.sort(compare);

        function compare(a,b) {
            if (a.sortDate > b.sortDate) {
                return -1;
            }
            if (a.sortDate < b.sortDate) {
                return 1;
            }
            return 0;
        }

    };

    this.addFromTechnicals = function(technical) {

        var frame1 = technical.rsi.length - 1;
        var frame2 = technical.rsi.length - stockConstants.range;

        while (true) {

            if (technical.rsi[frame1] > 0) {
                bull(this);
                bear(this);
            } 
            frame1--;
            frame2--;

            if (frame2 < 0) {
                break;
            }

        }

        return; // End of addFromTechnicals

        function bull(trades) {

            var i1 = 0;
            var i2 = 0;
            var atr = 0.0;
            var base = 0.0;
            var close1 = 99999.9;
            var close2 = 0.0;
            var rsi1 = 100;
            var rsi2 = 0.0;
            var pullback_strength = 0.0;
            var price_strength = 0.0;
            var rsi_strength = 0.0;
            var pull = 0.0;
            var position = frame(1);

            i1 = frame1;
            
            while (true) {
                
                if (Number(technical.close[i1]) <= close1) {
                    close1 = Number(technical.close[i1]);
                    rsi1 = Number(technical.rsi[i1]);
                    i2 = i1;
                }
                i1--;
                if (i1 === frame2) {
                    break;
                }
            }

            i2--;
            
            while (true) {
                if (technical.high[i2] >= pull) {
                    pull = Number(technical.high[i2]);
                    atr = Number(technical.atr[i2]);
                }
                
                i2--;
                if (i2 < frame2) {
                    break;
                }
            }

            close2 = Number(technical.close[position]);
            rsi2 = Number(technical.rsi[position]);
            base = Number(close1 + (atr * stockConstants.baseATR));
            pullback_strength = Number(((pull - close2) / atr).toFixed(2));
            price_strength = Number(((base - close2) / (atr / 10)).toFixed(1));
            rsi_strength = Number((rsi2 - rsi1).toFixed(1));
            if (pullback_strength >= stockConstants.rewardATR && price_strength >= 0 && rsi_strength >= stockConstants.rsiX && (price_strength + rsi_strength) >= stockConstants.divergX) {
                trigger(trades, technical, 1, rsi_strength, price_strength);
            }

            return; // End of bull

        }

        function bear(trades) {

            var i1 = 0;
            var i2 = 0;
            var atr = 0.0;
            var base = 0.0;
            var close1 = 0.0;
            var close2 = 0.0;
            var rsi1 = 0.0;
            var rsi2 = 0.0;
            var pullback_strength = 0.0;
            var price_strength = 0.0;
            var rsi_strength = 0.0;
            var pull = 99999.9;
            var position = frame(1);

            i1 = frame1;

            while (true) {

                if (Number(technical.close[i1]) >= close1) {
                    close1 = Number(technical.close[i1]);
                    rsi1 = Number(technical.rsi[i1]);
                    i2 = i1;
                }
                i1--;
                if (i1 === frame2) {
                    break;
                }
            }

            i2--;
            
            while (true) {
                if (technical.low[i2] <= pull) {
                    pull = Number(technical.low[i2]);
                    atr = Number(technical.atr[i2]);
                }

                i2--;

                if (i2 < frame2) {
                    break;
                }
            }

            close2 = Number(technical.close[position]);
            rsi2 = Number(technical.rsi[position]);
            base = Number(close1 - atr * stockConstants.baseATR);
            pullback_strength = Number(((close2 - pull) / atr).toFixed(2));
            price_strength = Number(((close2 - base) / (atr / 10)).toFixed(1));
            rsi_strength = Number((rsi1 - rsi2).toFixed(1));
            if (pullback_strength >= stockConstants.rewardATR && price_strength >= 0 && rsi_strength >= stockConstants.rsiX && (price_strength + rsi_strength) >= stockConstants.divergX) {
                trigger(trades, technical, -1, rsi_strength, price_strength);
            }
            
            return; // End of bear

        }

        function trigger(trades, technical, direction, rsi, price) {

            var newTrade = new trade(technical.ticker);
            var position = frame(1);

            var dateFrom = new Date();
            var dateString = "";

            dateFrom.setDate(dateFrom.getDate() - stockConstants.dateRange);

            newTrade.close = technical.close[position];
            newTrade.riskPercent = 2 + Number(((Math.max(16, Math.min(31, rsi * 2 + price)) - 16) / 7.5).toFixed(1));
            newTrade.stopPA = Number(technical.atr[position] * stockConstants.riskATR).toFixed(1);
            newTrade.stopAT = Number(technical.close[position] - newTrade.stopPA * direction).toFixed(1);
            newTrade.limitPA = Number(technical.atr[position] * stockConstants.rewardATR).toFixed(1);
            newTrade.limitAT = Number(technical.close[position] + newTrade.limitPA * direction).toFixed(1);
            newTrade.size = Number(stockConstants.range * newTrade.riskPercent / 100 / newTrade.stopPA).toFixed(2) * direction;
            newTrade.direction = direction;
            newTrade.date = technical.date[position];
            newTrade.desc = technical.desc[position];

            dateString = stockDateToDate(newTrade.date);
            newTrade.sortDate = new Date(dateString); 

            // Only add in last x days
            if (newTrade.sortDate > dateFrom) {
                trades.addTrade(newTrade);
            }
        }

        function frame(frameNumber) {
            return frame2 + frameNumber - 1;
        }

    };

};

function btnRefresh(allTrades) {
    // window.alert("function refresh");
    tickerFailedProcesses.reset();
    resetErrors();

    globalVars.latestDate = [];
    allTrades.reset();
    refreshGrid(allTrades);
}

function checkSingleClick(allTrades) {
    // window.alert("function refresh");

    // cookieSet("checkSingleClick", document.getElementById("checkSingle").checked);
    // refreshTickerGrid(allTrades);
}

function refreshGrid(allTrades) {
    
    // var baseURL = " /historical?output=csv&q=LON:";
    var baseURL = "https://www.google.com/finance/historical?output=csv&q=LON:";
    var ticker = 0; 
    
    var allStockDates = new stockDates;
    var title = "";
    
    var baseURL = "https://4wozjkt3qk.execute-api.us-east-1.amazonaws.com/prod/getTicker?ticker=";
    if (location.hostname === "localhost") {
        // var baseURL = "http://localhost:8000/getTicker?ticker=";
    }

    updateProgress(0, tickers.length);

    // window.alert(tickerList.length);
    for (ticker = 0; ticker < tickers.length; ticker++) {
         httpGetCSVandUpdate(baseURL, tickers[ticker].ticker, allStockDates, allTrades);
         // yqlGetStocksandUpdate(tickers[ticker].ticker, allStockDates, allTrades);
    }

    title = refreshTickerGridFillHeaderStart(); 
    title += refreshTickerGridFillHeader();
    title += refreshTickerGridFillHeaderEnd();
    

    document.getElementById("stockgrid").innerHTML = title;

}

function refreshTickerGridFillHeaderStart() {
    
    var checkValue = false;
    var newGrid = "";
    
    checkValue = globalVars.singleRow;

    if (globalVars.useTable && !checkValue) {
        newGrid = "<div><table class=\"table table-bordered table-striped\" className=\"responsive-table\">";
    }
    else {
        newGrid = "<div class=\"container-fluid\">";
    }

    return newGrid;

}

function refreshTickerGridFillHeaderEnd() {
    
    var newGrid = "";
    
    newGrid += "</table></div>";

    return newGrid;

}

function refreshLatestDate() {
    
    var newLatestDate = "";
    var latestDateText = "";
    var latestDate = "";
    var checkDate = "";
    var datePos = 0;
    var latestDateCount = 0;
    var errorDIV = "";
    var someUndefined = false;

    // Find the latest date
    for (datePos = 0; datePos < globalVars.latestDate.length; datePos++) {

        if (globalVars.latestDate[datePos] === undefined) {
            someUndefined = true;
            continue;
        }

        checkDate = new Date(globalVars.latestDate[datePos].date);
        if (latestDate === "" || checkDate > newLatestDate) {
            latestDate = globalVars.latestDate[datePos].date;
            newLatestDate = new Date(globalVars.latestDate[datePos].date);
        }
    }

    // Count the total latest dates
    for (datePos = 0; datePos < globalVars.latestDate.length; datePos++) {

        if (globalVars.latestDate[datePos] === undefined) {
            continue;
        }

        if (latestDate === globalVars.latestDate[datePos].date) {
            latestDateCount++;
        }
        else {

            if (!someUndefined && globalVars.latestDate.length === tickers.length && globalVars.showInfo) {

                errorDIV = document.getElementById("errors").innerHTML;

                errorDIV += "<div class=\"alert alert-info alert-dismissible fade in\" role=\"alert\">";
                errorDIV += "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">";
                errorDIV += "<span aria-hidden=\"true\">&times;</span>";
                errorDIV += "</button>";
                errorDIV += "<strong>Info!</strong> " + globalVars.latestDate[datePos].date + " latest date for ticker (" + globalVars.latestDate[datePos].ticker + ")."; 
                errorDIV += "</div>";

                document.getElementById("errors").innerHTML = errorDIV;

            }

        }
    }

    // Display date
    if (latestDate !== "") {

        latestDateText += "<div class=\"latestdate\" id=\"latestdate\"";
        latestDateText += "<h6>Latest date - " + latestDate + " " + "<span class=\"tag tag-default\">" + Number(latestDateCount) + "/" + Number(globalVars.latestDate.length)  + "</span>";
        latestDateText += "</h6>";
        latestDateText += "</div>";
        document.getElementById("latestdate").innerHTML = latestDateText;
                
    }

}

function refreshTickerGridFillHeader() {

    var style = "background-color:lavender; border: 1px solid #ccc;";
    var newGrid = "";
    var checkValue = false;

    checkValue = globalVars.singleRow;
 
    if (checkValue) {

            // Do nothing

    }
    else {

        if (globalVars.useTable) {

            newGrid += "<tr>";
            newGrid += "<th>Date</th>";
            newGrid += "<th>Ticker</th>";
            newGrid += "<th>Risk%</th>";
            newGrid += "<th>Price</th>";
            newGrid += "<th>Stop PA</th>";
            newGrid += "<th>Stop AT</th>";
            newGrid += "<th>Limit PA</th>";
            newGrid += "<th>Limit AT</th>";
            newGrid += "</tr>";
            

        }
        else {

            newGrid += "<div class=\"row\">"; 
            newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + "><b>Date</b></div>";
            newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>Ticker</b></div>";
            newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>Risk%</b></div>";
            newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>Price</b></div>";
            newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>StopPA</b></div>";
            newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + "><b>StopAT</b></div>";
            newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>LimitPA</b></div>";
            newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + "><b>LimitAT</b></div>";

            newGrid += "</div>";

        }

    }

    return newGrid;

}

function refreshTickerGrid(allTrades) {

    var style = "background-color:ghostwhite; border: 1px solid #ccc;";
    var styleHeading = "background-color:lavender; border: 1px solid #ccc;";
    var newGrid = "";
    var checkValue = false;
    var trade = 0;
    var date = "";
    var ticker = "";
    var riskPercent = "";
    var close = "";
    var size = "";
    var direction = 0;
    var stopPA = "";
    var stopAT = "";
    var limitPA = "";
    var limitAT = "";
    var url ="";
    
    checkValue = globalVars.singleRow;

    refreshLatestDate();
    newGrid = refreshTickerGridFillHeaderStart();
    newGrid += refreshTickerGridFillHeader();

    for (trade = 0; trade < allTrades.tradesList.length; trade++) { 

        date = removeYear(allTrades.tradesList[trade].date);
        ticker = allTrades.tradesList[trade].ticker;
        riskPercent = allTrades.tradesList[trade].riskPercent;
        close = allTrades.tradesList[trade].close;
        size = allTrades.tradesList[trade].size;
        direction = allTrades.tradesList[trade].direction;
        stopPA = allTrades.tradesList[trade].stopPA;
        stopAT = allTrades.tradesList[trade].stopAT;
        limitPA = allTrades.tradesList[trade].limitPA;
        limitAT = allTrades.tradesList[trade].limitAT;

        if (globalVars.useTable && !checkValue) {
           newGrid += "<tr>";
            newGrid += "<td>" + date + "</td>";
 
            // https://uk.finance.yahoo.com/quote/ANTO.L?p=ANTO.L
            url = "https://uk.finance.yahoo.com/quote/" + ticker + ".L?p=" + ticker + ".L";

            // newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + ">" + "<a href=\"" + url + "\">" +  ticker + "</a>" + "</div>";
   
            newGrid += "<td>" + "<a href=\"" + url + "\">" +  ticker + "</a>" + "</td>";
            // newGrid += "<td>" + ticker + "</td>";
            newGrid += "<td>" + riskPercent + "</td>";
            if (Number(direction) < 0) {
                newGrid += "<td bgcolor=\"#F2DEDE\">" + "-" + close + "</td>";
            } 
            else {
                newGrid += "<td bgcolor=\"#D9EDF7\">" + "+" + close + "</td>";
            } 
            newGrid += "<td>" + stopPA + "</td>";
            newGrid += "<td>" + stopAT + "</td>";
            newGrid += "<td>" + limitPA + "</td>";
            newGrid += "<td>" + limitAT + "</td>";
            newGrid += "</tr>";
        }
        else {
            if (checkValue) {

                newGrid += "<div class=\"row\">";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>Date</b></div>"; 
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + date + "</div>";
                newGrid += "</div>";

                newGrid += "<div class=\"row\">";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>Ticker</b></div>";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + ticker + "</div>";
                newGrid += "</div>";

                newGrid += "<div class=\"row\">";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>Risk%</b></div>";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + riskPercent + "</div>";
                newGrid += "</div>";

                newGrid += "<div class=\"row\">";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>Price</b></div>";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + close + "</div>";
                newGrid += "</div>";
        
                newGrid += "<div class=\"row\">";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>StopPA</b></div>";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + stopPA + "</div>";
                newGrid += "</div>";
                
                newGrid += "<div class=\"row\">";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>StopAT</b></div>";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + stopAT + "</div>";
                newGrid += "</div>";
                
                newGrid += "<div class=\"row\">";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>LimitPA</b></div>";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + limitPA + "</div>";
                newGrid += "</div>";
                
                newGrid += "<div class=\"row\">";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>LimitAT</b></div>";
                newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + limitAT + "</div>";
                newGrid += "</div>";

                if (trade < allTrades.tradesList.length) {
                    newGrid += "<div class=\"row\">";
                    newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + "></div>";
                    newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">"+"</div>";
                    newGrid += "</div>";
                }
                
            }
            else {
                
                newGrid += "<div class=\"row\">"; 
                newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + ">" + date + "</div>";

                // https://uk.finance.yahoo.com/quote/ANTO.L?p=ANTO.L
                url = "https://uk.finance.yahoo.com/quote/" + ticker + ".L?p=" + ticker + ".L";

                newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + ">" + "<a href=\"" + url + "\">" +  ticker + "</a>" + "</div>";
                newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + ">" + riskPercent + "</div>";
                newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + ">" + close + "</div>";
                newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + ">" + stopPA + "</div>";
                newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + ">" + stopAT + "</div>";
                newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + ">" + limitPA + "</div>";
                newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + ">" + limitAT + "</div>";
                newGrid += "</div>";
                
            }
        }
    }
    newGrid += refreshTickerGridFillHeaderEnd();
    
    document.getElementById("stockgrid").innerHTML = newGrid;

    return;

    function removeYear(date) {

        var newDate = "";
        var splitDate = [];

        splitDate = date.split("-");

        newDate = splitDate[0] + " " + splitDate[1]; 

        return newDate;

    }

}

function stockDateToDate(stringStockDate) {

    var txt = [];
    var dateString = "";

    txt = stringStockDate.split("-");

    dateString = txt[1] + " " + txt[0] + ", 20" + txt[2];

    return dateString;

}

function updateProgress(progress, maximum) {

    var progressDIV = " ";
    
    progressDIV = "<progress class=\"progress\" value=" + "\"" + progress + "\"" + " max=" + "\"" + maximum + "\"" + "></progress>";

    document.getElementById("progress").innerHTML = progressDIV;

    if (progress >= maximum) {
        document.getElementById("progress").innerHTML = "";
    }

}

function httpGetCSVandUpdate(baseURL, ticker, allStockDates, allTrades) {
    
    var xmlHttp = new XMLHttpRequest();
    var csvContent = [];
    var newTechnical = new technical();
    
    xmlHttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            // Action to be performed when the document is read;
            csvContent = parseCSV(xmlHttp.responseText);
            allStockDates.fillFromCSV(ticker, csvContent);
            // Add GT algorithm
            newTechnical.fillFromStockDates(ticker, allStockDates);
            allTrades.addFromTechnicals(newTechnical);
            allStockDates.processed++;
            updateProgress(allStockDates.processed, tickers.length);
            refreshTickerGrid(allTrades);
        }
    };
    xmlHttp.open( "GET", baseURL + ticker, true );
    xmlHttp.send();
    
}

// Google stock prices
// https://www.google.com/finance/getprices?q=BDEV&x=LON&p=10d

// YQL serves JSONP (with a callback) so all we have to do
// is create a script element with the right 'src':
function YQLQuery(query, callback, failedCallback, data) {
    this.query = query;
    this.data = data;
    this.callback = callback || function(){};
    this.failedCallback = failedCallback || function(){};
    this.fetch = function() {
 
        if (!this.query || !this.callback) {
            throw new Error('YQLQuery.fetch(): Parameters may be undefined');
        }

        var encodedQuery = encodeURIComponent(this.query);
        var instance = this;

        // Example select * from yahoo.finance.historicaldata where symbol = "ADM.L" and startDate = "2016-05-14" and endDate = "2017-05-18"

        $.getJSON('https://query.yahooapis.com/v1/public/yql','q='
                     + encodedQuery + '&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys&callback=',

            // JSON-P callback
            function(data, status, xhr) {
                instance.callback(data, instance.query);
            })
            .fail(function(jqxhr, textStatus, error) {
                instance.failedCallback(this.url, instance.data);
        });
    };
}

function yqlGetStocksandUpdate(ticker, allStockDates, allTrades) {
    
    var query = "";
    var newTicker = "";
    var jsonContent = [];
    var newTechnical = new technical();
    var dotPos = Number(ticker.indexOf("."));
    var startDate = new Date();
    var endDate = new Date();
    var data = {ticker: ticker, allStockDates: allStockDates, allTrades: allTrades};

    startDate.setFullYear(endDate.getFullYear() - 1);
    startDate.setDate(startDate.getDate() - 4);

    newTicker = ticker;
    // Change char of BT.A to BT-A 
    if (dotPos > 0 && dotPos < ticker.length - 1) {
        newTicker = ticker.replace(".","-");
    }

    // Change char of SN. to SN
    var dotPos = Number(ticker.indexOf(".")); 
    if (dotPos > 0 && dotPos === ticker.length - 1) {
        newTicker = ticker.replace(".","");
    }

    newTicker = newTicker + ".L";

    query = "select * from yahoo.finance.historicaldata where symbol = " + "\"" + newTicker +"\"";
    query = query + " and startDate = " + "\"" + buildDate(startDate) + "\"";
    query = query + " and endDate = " + "\"" + buildDate(endDate) + "\"";
    
    // Define your callback:
    var callback = function(data, query) {
        try {
            jsonContent = data.query.results.quote;
        }
        catch(err) {
            jsonContent = "";
            allStockDates.processed++;
            updateProgress(allStockDates.processed, tickers.length);
            return;
        }
        allStockDates.fillFromJSON(ticker, jsonContent);
        // Add GT algorithm
        newTechnical.fillFromStockDates(ticker, allStockDates);
        allTrades.addFromTechnicals(newTechnical);
        allStockDates.processed++;
        updateProgress(allStockDates.processed, tickers.length);
        refreshTickerGrid(allTrades);
        // window.alert(post);
    };

    var failedCallback = function(query, data) {

         replayGetStocksandUpdate(data.ticker, data.allStockDates, data.allTrades);

    };
    
    // Instantiate with the query:
    var ajaxianPosts = new YQLQuery(query, callback, failedCallback, data);
    
    // If you're ready then go:
    ajaxianPosts.fetch();

    function buildDate(date) {

        var newDate = "";
        var month = "";
        var day ="";

        month = date.getMonth() + 1;
        day = date.getDate();

        newDate = date.getFullYear() + "-";
    
        // Month
        if (month.toString().length === 1) {
            newDate = newDate + "0";
        }

        newDate = newDate + month + "-";

        // Day
        if (day.toString().length === 1) {
            newDate = newDate + "0";
        }
        
        newDate = newDate + day;
        
        return newDate;

    }

}

function resetErrors() {

    document.getElementById("errors").innerHTML = "";
}

function replayGetStocksandUpdate(ticker, allStockDates, allTrades) {

    var errorDIV = "";

    if (tickerFailedProcesses.count(ticker) >= 3) {
        // Show failed ticker

        errorDIV = document.getElementById("errors").innerHTML;

        errorDIV += "<div class=\"alert alert-warning alert-dismissible fade in\" role=\"alert\">";
        errorDIV += "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">";
        errorDIV += "<span aria-hidden=\"true\">&times;</span>";
        errorDIV += "</button>";
        errorDIV += "<strong>Warning!</strong> Unable to retrieve ticker (" + ticker + ")."; 
        errorDIV += "</div>";

        document.getElementById("errors").innerHTML = errorDIV;

    }
    else {

        // Delete existing entries
        allStockDates.deleteTicker(ticker);

        tickerFailedProcesses.add(ticker);
        yqlGetStocksandUpdate(ticker, allStockDates, allTrades);
    }

}

function parseCSV(input, option) {
    try {   
        var l;
        var cell;
        var words;
        // output object
        var data = {},
        // output no columns array
        container = [],
        // output array
        records = [],
        // splits csv data at each new line
        lines =input.split(/\r\n|\r|\n/),
        // creates columns by splitting first line of csv
        columns = lines[0].split(',');
        // creates objects from csv data if column option included
        if (option === true) {
            // loop through each line of csv file
            for (l = 1; l <= lines.length-1; l++) {
                // splits each line of csv by comma
                words = lines[l].split(',');

                // builds object based on column headers
                for (cell in columns) {
                    if (!columns.hasOwnProperty(cell)) {
                        continue;
                    }
                    data[columns[cell]] = words[cell];          
                }
                // pushes object to output array
                records.push(data);
                // resets object in order to add another
                data = {};
            }
        }
        else {
            // creates nested arrays from csv data if column option omitted,false or not true
            for (l = 0; l <= lines.length-1; l++) {
                // splits each line of csv by comma
                words = lines[l].split(',');
                // creates objects from csv data
                for (cell in words) {
                    if (!columns.hasOwnProperty(cell)) {
                        continue;
                    }
                    container.push(words[cell]);    
                }
                // push array to output array
                records.push(container);
                // reset array in order to add another
                container = [];
            }
        }
        // returns output array
        return records;
    }
    catch(err) {
        return err;
    }
}

var tickerstest = [{ticker: "HSBA", desc: "Capita"}];

var tickers = [{ticker: "ADM", desc: "Admiral Group"},
{ticker :"AAL", desc: "Anglo American"},
{ticker: "ANTO", desc: "Antofagasta"},
{ticker: "AHT", desc: "Ashtead Group"}, 
{ticker: "ABF", desc: "Associated British Foods"},
{ticker: "AZN", desc: "Astrazeneca"},
{ticker: "AV.", desc: "Aviva"},
{ticker: "BAB", desc: "Babcock International"},
{ticker: "BA.", desc: "Bae Systems"},
{ticker: "BARC", desc: "Barclays"},
{ticker: "BDEV", desc: "Barratt Developments"},
{ticker: "BLT", desc: "Bhp Billiton"},
{ticker: "BP", desc: "Bp"},
{ticker: "BATS", desc: "British American Tobacco"},
{ticker: "BKG", desc: "Berkeley Group"},
{ticker: "BLND", desc: "British Land"},
{ticker: "BT.A", desc: "Bt Group"},
{ticker: "BNZL", desc: "Bunzl"},
{ticker: "BRBY", desc: "Burberry"},
{ticker: "CPI", desc: "Capita"},
{ticker: "CCL", desc: "Carnival Corporation & Plc"},
{ticker: "CNA", desc: "Centrica"},
{ticker: "CCH", desc: "Coca-Cola Hbc Ag"},
{ticker: "CPG", desc: "Compass Group"},
{ticker: "CRDA", desc: "Croda International Plc"},
{ticker: "CRH", desc: "Crh Plc"},
{ticker: "DCC", desc: "Dcc"},
{ticker: "DGE", desc: "Diageo"},
{ticker: "DLG", desc: "Direct Line Group"},
{ticker: "EZJ", desc: "Easyjet"},
{ticker: "EXPN", desc: "Experian"},
{ticker: "FERG", desc: "Ferguson"},
{ticker: "FRES", desc: "Fresnillo Plc"},
{ticker: "GFS", desc: "G4S plc"},
{ticker: "GKN", desc: "Gkn"},
{ticker: "GSK", desc: "Glaxosmithkline"},
{ticker: "GLEN", desc: "Glencore"},
{ticker: "HMSO", desc: "Hammerson"},
{ticker: "HL", desc: "Hargreaves Lansdown"},
{ticker: "HSBA", desc: "Hsbc"},
{ticker: "IAG", desc: "International Consolidated Air"},
{ticker: "IHG", desc: "Intercontinental Hotels Group"},
{ticker: "III", desc: "3i Group"},
{ticker: "IMB", desc: "Imperial Brands"},
{ticker: "INF", desc: "Informa"},
{ticker: "ITRK", desc: "Intertek"},
{ticker: "ITV", desc: "ITV Itv Plc"},
{ticker: "JMAT", desc: "Johnson Matthey"},
{ticker: "KGF", desc: "Kingfisher Plc"},
{ticker: "LAND", desc: "Land Securities"},
{ticker: "LGEN", desc: "Legal & General"},
{ticker: "LLOY", desc: "Lloyds Banking Group"},
{ticker: "LSE", desc: "London Stock Exchange Group"},
{ticker: "MKS", desc: "Marks & Spencer"},
{ticker: "MDC", desc: "Mediclinic"},
{ticker: "MERL", desc: "Merlin"},
{ticker: "MCRO", desc: "Micro Focus"},
{ticker: "MNDI", desc: "Mondi"},
{ticker: "MRW", desc: "Morrisons"},
{ticker: "NG", desc: "National Grid Plc"},
{ticker: "NMC", desc: "NMC Health"},
{ticker: "NXT", desc: "Next Plc"},
{ticker: "OML", desc: "Old Mutual"},
{ticker: "PPB", desc: "Paddy Power Bet"},
{ticker: "PSON", desc: "Pearson Plc"},
{ticker: "PSN", desc: "Persimmon Plc"},
{ticker: "PRU", desc: "Prudential Plc"},
{ticker: "RRS", desc: "Randgold Resources"},
{ticker: "RB", desc: "Reckitt Benckiser"},
{ticker: "REL", desc: "Relx Group"},
{ticker: "RIO", desc: "Rio Tinto Group"},
{ticker: "RR.", desc: "Rolls-Royce Holdings"},
{ticker: "RBS", desc: "Royal Bank Of Scotland Group"},
{ticker: "RDSA", desc: "Royal Dutch Shell A"},
{ticker: "RDSB", desc: "Royal Dutch Shell B"},
{ticker: "RSA", desc: "Rsa Insurance Group"},
{ticker: "RTO", desc: "Rentokil"},
{ticker: "SGE", desc: "Sage Group"},
{ticker: "SBRY", desc: "Sainsburys"},
{ticker: "SDR", desc: "Schroders"},
{ticker: "SGRO", desc: "SEGRO plc"},
{ticker: "SVT", desc: "Severn Trent"},
{ticker: "SHP", desc: "Shire Plc"},
{ticker: "SKG", desc: "Smurfit Kappa Group"},
{ticker: "SKY", desc: "Sky Plc"},
{ticker: "SN.", desc: "Smith & Nephew"},
{ticker: "SMIN", desc: "Smiths Group"},
// {ticker: "SMT", desc: "Scottish Mortgage Investment"},
{ticker: "SSE", desc: "Sse Plc"},
{ticker: "STJ", desc: "St. James's Place Plc"},
{ticker: "STAN", desc: "Standard Chartered"},
{ticker: "SL", desc: "Standard Life"},
{ticker: "TW.", desc: "Taylor Wimpey"},
{ticker: "TSCO", desc: "Tesco"},
{ticker: "TUI", desc: "Tui Group"},
{ticker: "ULVR", desc: "Unilever"},
{ticker: "UU", desc: "United Utilities"},
{ticker: "VOD", desc: "Vodafone Group"},
{ticker: "WTB", desc: "Whitbread"},
{ticker: "WPG", desc: "Worldpay"},
{ticker: "WPP", desc: "WPP"}];

// Setup screen
var allTrades = new trades();
buildScreen();

function buildScreen() {

    var screen = "";
    var checkValue = "";

    // checkValue = cookieGet("checkSingleClick");

    screen += "<div class=\"container\">";
    screen += "<div class=\"page-header\">";
    screen += "<h1><img src=\"whiteshoeleft.jpg\" class=\"img-rounded\" alt=\"Cinque Terre\" width=\"76\" height=\"59\"> White Shoes Market Predictions";
    screen += "<img src=\"whiteshoeright.jpg\" class=\"img-rounded\" alt=\"Cinque Terre\" width=\"76\" height=\"59\">";      
    screen += "</h1>";
    screen += "</div>";
    screen += "<p>Geordie's Patented Dodgy Stock Market Predictions (v" + version + ")</p>";            
    screen += "</div>";

    screen += "<div class=\"container\">";
    screen += "<p>";
    screen += "<button class=\"btn btn-lg btn-primary\" id=\"btnRefresh\" style=\"display: inline;\" onclick=\"btnRefresh(allTrades)\">Refresh</button>";
    // screen += "    <label class=\"checkbox-inline\" onclick=\"checkSingleClick(allTrades)\"><input type=\"checkbox\" id=\"checkSingle\" value=\"\">Single row</label>";
    screen += "</p>";
    screen += "</div>";

    screen += "<div class=\"latestdate\" id=\"latestdate\"></div>";
    screen += "<div class=\"progress\" id=\"progress\"></div>"; // <!-- /progress -->
    screen += "<div class=\"errors\" id=\"errors\"></div>"; // <!-- /errors -->
    screen += "<div class=\"stockgrid\" id=\"stockgrid\"></div>"; // <!-- /stockgrid -->
    screen += "</div>";
    
    document.getElementById("container").innerHTML = screen;
    // if (checkValue === "true") {
        // document.getElementById("checkSingle").checked = true;
    // }

}

function cookieSet(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function cookieGet(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)===' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
} 

// Run refresh immediately
// btnRefresh(allTrades);