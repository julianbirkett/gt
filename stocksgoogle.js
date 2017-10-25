"use strict";

function stockDate(ticker, date, open, high, low, close, volume) {
    this.ticker = ticker;
    this.date = date;
    this.open = open;
    this.high = high;
    this.low = low;
    this.close = close;
    this.volume = volume;
}

var stockConstants = {capital: 7000, baseATR: 0.2, rsiX: 7, divergX: 8, riskATR: 2.0, rewardATR: 1.5, dateRange: 30};

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

            ticker = rowData.Symbol.replace(".L","");

            stockDate = {ticker: ticker};
            stockDate.open = rowData.Open;
            stockDate.close = rowData.Close;
            stockDate.date = rowData.Date;
            stockDate.high = rowData.High;
            stockDate.low = rowData.Low;
            stockDate.volume = rowData.Volume;

            this.addStockDate(stockDate);

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
        
        this.ticker = ticker;

        // Get array of tickers
        tickerList = allStockDates.getTickerList(ticker);

        frame2 = tickerList.length - 40;
        
        // frame1
        i = tickerList.length - 1;
        
        while (true) {

            open = Number(tickerList[i].open).toFixed(1);
            close = Number(tickerList[i].close).toFixed(1);

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
        var frame2 = technical.rsi.length - 20;

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
            pullback_strength = Number(((pull - close2) / atr).toFixed(1));
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
            pullback_strength = Number(((close2 - pull) / atr).toFixed(1));
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
            newTrade.riskPercent = 2 + Number(((Math.max(16, Math.min(31, rsi * 2 + price)) - 16) / 5).toFixed(1));
            newTrade.stopPA = Number(technical.atr[position] * stockConstants.riskATR).toFixed(1);
            newTrade.stopAT = Number(technical.close[position] - newTrade.stopPA * direction).toFixed(1);
            newTrade.limitPA = Number(technical.atr[position] * stockConstants.rewardATR).toFixed(1);
            newTrade.limitAT = Number(technical.close[position] + newTrade.limitPA * direction).toFixed(1);
            newTrade.size = Number(stockConstants.capital * newTrade.riskPercent / 100 / newTrade.stopPA).toFixed(2) * direction;
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
    allTrades.reset();
    refreshGrid(allTrades);
    //testURL();
}

function testURL() {
    // Construct your query:
    var query = "select * from yahoo.finance.historicaldata where symbol = \"VOD.L\" and startDate = \"2015-11-12\" and endDate = \"2016-11-12\"";
    
    // Define your callback:
    var callback = function(data) {
        var post = data.query.count;
        window.alert(post);
    };
    
    // Instantiate with the query:
    var ajaxianPosts = new YQLQuery(query, callback);
    
    // If you're ready then go:
    ajaxianPosts.fetch(); 

}

// YQL serves JSONP (with a callback) so all we have to do
// is create a script element with the right 'src':
function YQLQuery(query, callback) {
    this.query = query;
    this.callback = callback || function(){};
    this.fetch = function() {
 
        if (!this.query || !this.callback) {
            throw new Error('YQLQuery.fetch(): Parameters may be undefined');
        }
 
        var scriptEl = document.createElement('script'),
            uid = 'yql' + +new Date(),
            encodedQuery = encodeURIComponent(this.query),
            instance = this;
 
        YQLQuery[uid] = function(json) {
            instance.callback(json);
            delete YQLQuery[uid];
            document.body.removeChild(scriptEl);
        };
 
        scriptEl.src = 'https://query.yahooapis.com/v1/public/yql?q='
                     + encodedQuery + '&env=http://datatables.org/alltables.env&format=json&callback=YQLQuery.' + uid; 
        document.body.appendChild(scriptEl);
 
    };
}

function checkSingleClick(allTrades) {
    // window.alert("function refresh");

    cookieSet("checkSingleClick", document.getElementById("checkSingle").checked);
    refreshTickerGrid(allTrades);
}

function refreshGrid(allTrades) {
    
    var baseURL = "https://www.google.com/finance/historical?output=csv&q=LON:";
    var ticker = 0; 
    
    var allStockDates = new stockDates;
    
    updateProgress(0, tickers.length);

    // window.alert(tickerList.length);
    for (ticker = 0; ticker < tickers.length; ticker++) {
         httpGetCSVandUpdate(baseURL, tickers[ticker].ticker, allStockDates, allTrades);
         // yqlGetStocksandUpdate(tickers[ticker].ticker, allStockDates, allTrades);
    }

    document.getElementById("stockgrid").innerHTML = refreshTickerGridFillHeader();

}

function refreshTickerGridFillHeader() {

    var style = "background-color:lavender; border: 1px solid #ccc;";
    var newGrid = "";
    var checkValue = false;

    checkValue = document.getElementById("checkSingle").checked;
    
    if (checkValue) {

        if (1===2) {
        newGrid += "<div class=\"row\">"; 
        newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + "><b>Date</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>Ticker</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>Risk%</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>Price</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>Size</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>StopPA</b></div>";
        newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + "><b>StopAT</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>LimitPA</b></div>";
        newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + "><b>LimitAT</b></div>";
        
        newGrid += "</div>";
        }

    }
    else {

        newGrid += "<div class=\"row\">"; 
        newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + "><b>Date</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>Ticker</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>Risk%</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>Price</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>Size</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>StopPA</b></div>";
        newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + "><b>StopAT</b></div>";
        newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + "><b>LimitPA</b></div>";
        newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + "><b>LimitAT</b></div>";
        
        newGrid += "</div>";

    }

    return newGrid;

}

function refreshTickerGrid(allTrades) {

    var style = "background-color:ghostwhite; border: 1px solid #ccc;";
    var styleHeading = "background-color:lavender; border: 1px solid #ccc;";
    var newGrid = "";
    var checkValue = false;
    var trade = 0;
    
    checkValue = document.getElementById("checkSingle").checked;

    newGrid = "<div class=\"container-fluid\">";
    newGrid += refreshTickerGridFillHeader();

    for (trade = 0; trade < allTrades.tradesList.length; trade++) { 

        if (checkValue) {

            newGrid += "<div class=\"row\">";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>Date</b></div>"; 
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].date + "</div>";
            newGrid += "</div>";

            newGrid += "<div class=\"row\">";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>Ticker</b></div>";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].ticker + "</div>";
            newGrid += "</div>";

            newGrid += "<div class=\"row\">";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>Risk%</b></div>";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].riskPercent + "</div>";
            newGrid += "</div>";

            newGrid += "<div class=\"row\">";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>Price</b></div>";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].close + "</div>";
            newGrid += "</div>";
    
            newGrid += "<div class=\"row\">";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>Size</b></div>";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].size + "</div>";
            newGrid += "</div>";

            newGrid += "<div class=\"row\">";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>StopPA</b></div>";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].stopPA + "</div>";
            newGrid += "</div>";
            
            newGrid += "<div class=\"row\">";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>StopAT</b></div>";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].stopAT + "</div>";
            newGrid += "</div>";
            
            newGrid += "<div class=\"row\">";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>LimitPA</b></div>";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].limitPA + "</div>";
            newGrid += "</div>";
            
            newGrid += "<div class=\"row\">";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + styleHeading + "\"" + "><b>LimitAT</b></div>";
            newGrid += "<div class=\"col-xs-6\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].limitAT + "</div>";
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
            newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].date + "</div>";
            newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].ticker + "</div>";
            // newGrid += "<div class=\"col-xs-3\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].desc + "</div>";
            newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].riskPercent + "</div>";
            newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].close + "</div>";
            newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].size + "</div>";
            newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].stopPA + "</div>";
            newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].stopAT + "</div>";
            newGrid += "<div class=\"col-xs-1\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].limitPA + "</div>";
            newGrid += "<div class=\"col-xs-2\" style=" + "\"" + style + "\"" + ">" + allTrades.tradesList[trade].limitAT + "</div>";
            newGrid += "</div>";

        }
    }
    newGrid += "</div>";

    document.getElementById("stockgrid").innerHTML = newGrid;

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

function yqlGetStocksandUpdate(ticker, allStockDates, allTrades) {
    
    var query = "";
    var newTicker = "";
    var jsonContent = [];
    var newTechnical = new technical();
    var dotPos = Number(ticker.indexOf("."));
    var startDate = new Date();
    var endDate = new Date();

    startDate.setFullYear(endDate.getFullYear() - 1);
    startDate.setDate(startDate.getDate() + 4);

    newTicker = ticker;
    // Change char of BT.A to BT-A 
    if (dotPos > 0 && dotPos < ticker.length - 1) {
        newTicker = ticker.replace(".","-");
    }
    newTicker = newTicker + ".L";

    query = "select * from yahoo.finance.historicaldata where symbol = " + "\"" + newTicker +"\"";
    query = query + " and startDate = " + "\"" + buildDate(startDate) + "\"";
    query = query + " and endDate = " + "\"" + buildDate(endDate) + "\"";
    
    // Define your callback:
    var callback = function(data) {
        jsonContent = data.query.results.quote;
        allStockDates.fillFromJSON(ticker, jsonContent);
        // Add GT algorithm
        newTechnical.fillFromStockDates(ticker, allStockDates);
        allTrades.addFromTechnicals(newTechnical);
        allStockDates.processed++;
        updateProgress(allStockDates.processed, tickers.length);
        refreshTickerGrid(allTrades);
        // window.alert(post);
    };
    
    // Instantiate with the query:
    var ajaxianPosts = new YQLQuery(query, callback);
    
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

var tickers = [{ticker: "WPP", desc: "Capita"}];

var tickerstest = [{ticker: "III", desc: "3I"}, 
{ticker: "ADM", desc: "Admiral Group"},
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
{ticker: "BLND", desc: "British Land"},
{ticker: "BT.A", desc: "Bt Group"},
{ticker: "BNZL", desc: "Bunzl"},
{ticker: "BRBY", desc: "Burberry"},
{ticker: "CPI", desc: "Capita"},
{ticker: "CCL", desc: "Carnival Corporation & Plc"},
{ticker: "CNA", desc: "Centrica"},
{ticker: "CCH", desc: "Coca-Cola Hbc Ag"},
{ticker: "CPG", desc: "Compass Group"},
{ticker: "CRH", desc: "Crh Plc"},
{ticker: "DCC", desc: "Dcc"},
{ticker: "DGE", desc: "Diageo"},
{ticker: "DLG", desc: "Direct Line Group"},
{ticker: "DC", desc: "Dixons Carphone"},
{ticker: "EZJ", desc: "Easyjet"},
{ticker: "EXPN", desc: "Experian"},
{ticker: "FRES", desc: "Fresnillo Plc"},
{ticker: "GKN", desc: "Gkn"},
{ticker: "GSK", desc: "Glaxosmithkline"},
{ticker: "GLEN", desc: "Glencore"},
{ticker: "HMSO", desc: "Hammerson"},
{ticker: "HL", desc: "Hargreaves Lansdown"},
{ticker: "HIK", desc: "Hikma Pharmaceuticals"},
{ticker: "HSBA", desc: "Hsbc"},
{ticker: "IMB", desc: "Imperial Brands"},
{ticker: "INF", desc: "Informa"},
{ticker: "IHG", desc: "Intercontinental Hotels Group"},
{ticker: "IAG", desc: "International Consolidated Air"},
{ticker: "ITRK", desc: "Intertek"},
{ticker: "INTU", desc: "Intu PropertiesITV Itv Plc"},
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
{ticker: "NXT", desc: "Next Plc"},
{ticker: "OML", desc: "Old Mutual"},
{ticker: "PPB", desc: "Paddy Power Bet"},
{ticker: "PSON", desc: "Pearson Plc"},
{ticker: "PSN", desc: "Persimmon Plc"},
{ticker: "POLY", desc: "Polymetal"},
{ticker: "PFG", desc: "Provident Financial"},
{ticker: "PRU", desc: "Prudential Plc"},
{ticker: "RRS", desc: "Randgold Resources"},
{ticker: "RB", desc: "Reckitt Benckiser"},
{ticker: "REL", desc: "Relx Group"},
{ticker: "RIO", desc: "Rio Tinto Group"},
{ticker: "RR.", desc: "Rolls-Royce Holdings"},
{ticker: "RBS", desc: "Royal Bank Of Scotland Group"},
{ticker: "RDSA", desc: "Royal Dutch Shell A"},
{ticker: "RDSB", desc: "Royal Dutch Shell B"},
{ticker: "RMG", desc: "Royal Mail"},
{ticker: "RSA", desc: "Rsa Insurance Group"},
{ticker: "SAB", desc: "Sabmiller"},
{ticker: "SGE", desc: "Sage Group"},
{ticker: "SBRY", desc: "Sainsburys"},
{ticker: "SDR", desc: "Schroders"},
{ticker: "SVT", desc: "Severn Trent"},
{ticker: "SHP", desc: "Shire Plc"},
{ticker: "SKY", desc: "Sky Plc"},
{ticker: "SN.", desc: "Smith & Nephew"},
{ticker: "SMIN", desc: "Smiths Group"},
{ticker: "SSE", desc: "Sse Plc"},
{ticker: "STJ", desc: "St. James's Place Plc"},
{ticker: "STAN", desc: "Standard Chartered"},
{ticker: "SL", desc: "Standard LifeTW. Taylor Wimpey"},
{ticker: "TSCO", desc: "Tesco"},
{ticker: "TPK", desc: "Travis Perkins"},
{ticker: "TUI", desc: "Tui Group"},
{ticker: "ULVR", desc: "Unilever"},
{ticker: "UU", desc: "United Utilities"},
{ticker: "VOD", desc: "Vodafone Group"},
{ticker: "WTB", desc: "Whitbread"},
{ticker: "WOS", desc: "Wolseley Plc"},
{ticker: "WPG", desc: "Worldpay"},
{ticker: "WPP", desc: "Wpp Plc"}];

// Setup screen
var allTrades = new trades();
buildScreen();

function buildScreen() {

    var screen = "";
    var checkValue = "";

    checkValue = cookieGet("checkSingleClick");

    
    screen += "<h1><center><img src=\"whiteshoeleft.jpg\" class=\"img-rounded\" alt=\"Cinque Terre\" width=\"76\" height=\"59\">";
    screen += "White Shoes Market Predictions";
    screen += "<img src=\"whiteshoeright.jpg\" class=\"img-rounded\" alt=\"Cinque Terre\" width=\"76\" height=\"59\">";
    screen += "</center></h1>";

    screen += "<p class=\"lead\">Geordie's Patented Dodgy Stock Market Predictions";
    screen += "</p>";
    screen += "<p>";
    screen += "<button class=\"btn btn-lg btn-primary\" id=\"btnRefresh\" style=\"display: inline;\" onclick=\"btnRefresh(allTrades)\">Refresh</button>";
    screen += "    <label class=\"checkbox-inline\" onclick=\"checkSingleClick(allTrades)\"><input type=\"checkbox\" id=\"checkSingle\" value=\"\">Single row</label>";
    screen += "</p>";
    screen += "<div class=\"progress\" id=\"progress\"></div>"; // <!-- /progress -->
    
    screen += "<div class=\"stockgrid\" id=\"stockgrid\"></div>"; // <!-- /stockgrid -->

    document.getElementById("container").innerHTML = screen;
    if (checkValue === "true") {
        document.getElementById("checkSingle").checked = true;
    }

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
btnRefresh(allTrades);