import csv
import json
from pprint import pprint


#open planets.csv and read it as a OrderedDict
with open('planets.csv') as f:
    reader = csv.DictReader(f)
    planets_csv = list(reader)

#open legend.csv and read it as a OrderedDict
with open('original-data/legend.csv') as f:
    reader = csv.DictReader(f)
    legend_csv = list(reader)


#convert and store legend.csv to legend.json
with open('processed-json/legend.json', 'w') as f:
    json.dump(legend_csv, f)

#sanitize the data for easy read and understand
for planet in planets_csv:
    for legend in legend_csv:
        if(legend["legend"] in planet):
            planet[legend["meaning"]] = planet.pop(legend["legend"])
#pprint(planets_csv[1])

#convert and store planets.csv to planets.json
with open('processed-json/planets.json', 'w') as f:
    json.dump(planets_csv, f)
    #pprint(planets_csv[0])