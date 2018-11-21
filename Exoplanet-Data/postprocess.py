import csv
import json
from pprint import pprint

with open('processed-json/planets.json') as f:
    data = json.load(f)

pprint(data[0])