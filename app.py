from flask import Flask
from flask_cors import CORS, cross_origin
import requests
import os
import json

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/pages/views/<path:keywords>/<start>/<end>')
@cross_origin()
def fetch_wikipedia_pageviews_metric(keywords, start, end):
    url = f"""https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/{keywords}/daily/{start}/{end}"""
    # 1st method: I don't know why it broke in the middle of january 2021
    # response = requests.get(url, allow_redirects=True)
    # print(f"response.text => {response.text}")
    # json_object = response.json()

    # 2nd method: I don't know why, but curl was working
    json_object = json.loads(os.popen(f"curl {url}").read())
    return json_object
