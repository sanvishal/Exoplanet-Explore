from pprint import pprint
import pandas as pd
import numpy as np

planetData = pd.read_csv("original-data/planets.csv")
# lots of missing data!!!!!!!!!!!!!!!
# pprint(planetData.isnull().sum())
print("original data read...")

features = ['PlanetaryMassJpt', 'RadiusJpt', 'PeriodDays', 'SemiMajorAxisAU', 'Eccentricity',
            'SurfaceTempK', 'HostStarMassSlrMass', 'HostStarRadiusSlrRad',
            'HostStarMetallicity', 'HostStarTempK', 'HostStarAgeGyr']

matrix = planetData[features].dropna()
print("dropping all the null values...")


matrix.to_csv("../Analysis/public/corr-data/corr.csv")
matrix.to_csv("../Analysis/public/corr-data/scatter.csv")

print("\033[1m"+"csv exported to public/corr-data"+"\033[0m")
