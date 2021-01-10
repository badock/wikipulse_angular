from flask import Flask
from flask_cors import CORS, cross_origin
import requests

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/pages/views/<keywords>/<start>/<end>')
@cross_origin()
def fetch_wikipedia_pageviews_metric(keywords, start, end):
    url = f"""https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/{keywords}/daily/{start}/{end}"""
    return requests.get(url).json()
