// We are going to take the tickers and store them in local storage in the browser (different than storing in a file
// on the server side)

// the list of tickers are stored locally. If there are no tickers saved (such as when you start the program), it will be blank
var tickers = JSON.parse(localStorage.getItem('tickers')) || [];
// variable to hold last prices. Has to be initialized to zero because we haven't stored any prices yet.
var lastPrices = {};
// set the countdown seconds
var counter = 10;


function startUpdateCycle() {
    updatePrices();
    // to have the countdown functionality work, and have the seconds update, we create a countdown variable that is set to a 
    // setInterval function. Counter-- reduces counter var above by 1. Using $('#counter), we are connecting to the
    // element with the id 'counter' in the index.html file and setting it to the counter variable we declare here.
    // This works similar to useState in React
    setInterval(function () {
        counter--;
        $('#counter').text(counter);
        if (counter <= 0 ) {
            updatePrices();
            counter = 10;
        }
    // because this calls the setInterval setting, we need to end the function call with the time this is rerun, in milliseconds
    }, 1000)
}

// When you load the page, do the following - that's what $(document).ready does
$(document).ready(function () {
    // using the tickers variable declared above, we go through each one saved to local storage and add it to our grid
    // in an HTML element
    tickers.forEach(function(ticker) {
        addTickerToGrid(ticker);
    });
    console.log(tickers)

    // update prices when we load the page
    updatePrices();

    // we didn't declare actions in HTML for how to handle form submission, so we are doing it here, hence the $(add-ticker-form) call
    $('#add-ticker-form').submit(function(e) {
        // prevent default functionality from happening
        e.preventDefault();
        // this function says that when an event happens (inputting a stock ticker), we are pulling the information from the element
        // with the id of "new-ticker", taking the value, upper casing it. We get the content of the input
        var newTicker = $('#new-ticker').val().toUpperCase();
        // if this new ticker is not already part of the tickers list
        if (!tickers.includes(newTicker)) {
            // push the new ticker into the list
            tickers.push(newTicker);
            // and update local storage to include the updated list of tickers
            localStorage.setItem('tickers', JSON.stringify(tickers))
            // add the new ticker to the current grid
            addTickerToGrid(newTicker)
        }
        // after we've grabbed the value that was submitted, we clear the input field (so people can add more tickers)
        $('#new-ticker').val('');
        updatePrices();
    });

    // Each stock in the grid (id='tickers-grid' hence why the $ variable starts with a #) will have a remove button with the class
    // remove-btn (class='remove-btn' hence why the $ variable starts with a '.')
    $('#tickers-grid').on('click', '.remove-btn', function() {
        // if the button is clicked, then we save the ticker code
        var tickerToRemove = $(this).data('ticker');
        // filter out the removed ticker
        tickers = tickers.filter(t => t !== tickerToRemove)
        localStorage.setItem('tickers', JSON.stringify(tickers))
        // remove the item from the page
        $(`#${tickerToRemove}`).remove();
    })

    startUpdateCycle();
});

function addTickerToGrid(ticker) {
    // append the new ticker to the current ticker grid element
    // if (${ticker.info['regularMarketPrice']} == None) {

    // }
    $('#tickers-grid').append(`<div id="${ticker}" class="stock-box">
        <h2>${ticker}</h2>
        <p id="${ticker}-price"></p>
        <p id="${ticker}-pct"></p>
        <button class="remove-btn" data-ticker="${ticker}">Remove</button>
        </div>`)
}

function updatePrices() {

    tickers.forEach(function(ticker) {
        // send a post request to our backend (our Flask application) of the ticker name
        $.ajax({
            url: '/get_stock_data',
            type: 'POST',
            data: JSON.stringify({'ticker': ticker}),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            error: function(xhr, status, error) {
                // This is where you'd handle an invalid ticker response if the server sends back a non-200 status code.
                // Filter out the invalid ticker from your tickers array
                // This uses the same functionality as the "remove button" defined above
                tickers = tickers.filter(t => t !== ticker);
                localStorage.setItem('tickers', JSON.stringify(tickers));
                // Remove the ticker element from the page
                $(`#${ticker}`).remove();
                // Optionally restart the update cycle if necessary
                // startUpdateCycle(); // Be cautious with restarting update cycles to avoid excessive requests or infinite loops.
                console.error('Error fetching data for ticker:', ticker, 'Status:', status, 'Error:', error);
            },
            // if the post is successful (the ticker was valid), the following is performed
            success: function(data) {
                if (!data.valid) {
                    // if data is invalid, it will be handled by the error handling above
                    return;
                }
                var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
                
                // this is used to change the color of the text at various % changes
                var colorClass = getColorClass(changePercent);

                // show the actual ticker price and change percent, both to 2 decimal places
                updatePriceAndPercentage(ticker, data.currentPrice, changePercent, colorClass);

                // have the card flash a certain color depending on how the current price on the card (lastPrice) is different than the
                // current price from the API (currentPrice)
                handlePriceChangeAnimation(ticker, data.currentPrice);
            }
        });
    });
}

// These 3 functions used to exist (not as functions) in the success handling section above. Pulled them out to make the
// code cleaner to read

function getColorClass(changePercent) {
    if (changePercent <= -2) return 'dark-red';
    else if (changePercent < 0) return 'red';
    else if (changePercent == 0) return 'gray';
    else if (changePercent <= 2) return 'green';
    else return 'dark-green';
}

function updatePriceAndPercentage(ticker, currentPrice, changePercent, colorClass) {
    $(`#${ticker}-price`).text(`$${currentPrice.toFixed(2)}`).removeClass('dark-red red gray green dark-green').addClass(colorClass);
    $(`#${ticker}-pct`).text(`${changePercent.toFixed(2)}%`).removeClass('dark-red red gray green dark-green').addClass(colorClass);
}

function handlePriceChangeAnimation(){
    var flashClass;
    if (lastPrices[ticker] > data.currentPrice) flashClass = 'red-flash';
    else if (lastPrices[ticker] < data.currentPrice) flashClass = 'green-flash';
    else flashClass = 'gray-flash';

    lastPrices[ticker] = data.currentPrice;
    $(`#${ticker}`).addClass(flashClass);
    setTimeout(function() {$(`#${ticker}`).removeClass(flashClass)}, 1000);
}