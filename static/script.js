// We are going to take the tickers and store them in local storage in the browser (different than storing in a file
// on the server side)

// the list of tickers are stored locally. If there are no tickers saved (such as when you start the program), it will be blank
var tickers = JSON.parse(localStorage.getItem('tickers')) || [];
// variable to hold last prices. Has to be initialized to zero because we haven't stored any prices yet.
var lastPrices = {};
// set the countdown seconds
var counter = 15;


function startUpdateCycle() {
    updatePrices();
    // to have the countdown functionality work, and have the seconds update, we create a countdown variable that is set to a 
    // setInterval function. Counter-- reduces counter var above by 1. Using $('#counter), we are connecting to the
    // element with the id 'counter' in the index.html file and setting it to the counter variable we declare here.
    // This works similar to useState in React
    var countdown = setInterval(function () {
        counter--;
        $('#counter').text(counter);
        if (counter <= 0 ) {
            updatePrices();
            counter = 15;
        }
    // because this calls the setInterval setting, we need to end the function call with the time this is rerun, in milliseconds
    }, 1000)
}

// When you load the page, do the following - that's what $(document).ready does
$(document).ready(function () {
    // using the tickers variable declared above, we go through each one saved to local storage and add it to our grid
    // in an HTML element
    tickers.forEach(function(ticker) {
        addTickerToGrid();
    });

    // update prices when we load the page
    updatePrices();

    // we didn't declare actions in HTML for how to handle form submission, so we are doing it here, hence the $(add-ticker-form) call
    $('add-ticker-form').submit(function(e) {
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
        $('new-ticker').val('');
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
    $('#ticker-grid').append(`<div id="${ticker}" class="stock-box">
        <h2>${ticker}</h2>
        <p id="${ticker}-price"></p>
        <p id="${ticker}-pct"></p>
        <button class="remove-btn" data-ticker="${ticker}">Remove</button>
        </div>`)
}