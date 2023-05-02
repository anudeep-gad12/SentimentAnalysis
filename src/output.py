import json
import sys
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
arg = sys.argv[1]
def load_data_from_json(file_path):
    with open(file_path, "r") as f:
        data = json.load(f)
    return data

def main():
    file_path = "./sentiment.json"
    data = load_data_from_json(file_path)

    dates = [item["date"] for item in data]
    sentiment_values = [item["sentiment"] for item in data]

    plt.plot(dates, sentiment_values, label=arg)

    num_dates = len(dates)
    num_ticks = 8 
    tick_interval = num_dates // num_ticks
    tick_dates = dates[::tick_interval]
    plt.xticks(tick_dates, [date for date in tick_dates], rotation=45)

    # Set axis labels and title
    plt.xlabel("Date")
    plt.ylabel("Sentiment")
    plt.title("Sentiment Analysis Over Time")

    # Add the legend
    plt.legend()

    plt.show()

main()
