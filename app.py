# the backend will only be used to communicate with the yfinance API
import yfinance as yf
from flask import request, render_template, jsonify, Flask

# Create the app
app = Flask(__name__, template_folder='templates')

# This is used as the root of the page, and it renders the html file
@app.route('/')
def index():
    # render_template is a reference to the "templates" folder that the index.html file is stored in
    return render_template('index.html')

# This is the actual function that works to get the ticker and historical data
@app.route('/get_stock_data', methods=['POST'])
# The function to get the stock data
def get_stock_data():
    # requires a GET request for the "ticker" field
    ticker = request.get_json()['ticker']
    # then using yf, search for the ticker. The period can be blank because we are only looking for today
    # but if we wanted a different time, we'd have to input a different period 
    data = yf.Ticker(ticker).history(period='1y')
    # we are returning a dictionary object, returning the currentPrice and the openPrice. The [-1] grabs the data at the last position
    # The idea is to compare the currentPrice with the openPrice of the day and see if it's less or more
    return jsonify({'currentPrice': data.iloc[-1].Close,
                    'openPrice': data.iloc[-1].Open})

if __name__ == '__main__':
    app.run(debug=True)

# This is our whole backend of the flask application. A lot of information will actually be held in the frontend,
# like the tickers we choose. But what is set here will connect with the finance API and deliver the data