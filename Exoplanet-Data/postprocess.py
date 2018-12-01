from pprint import pprint
import pandas as pd
import numpy as np

planetData = pd.read_csv("original-data/planets.csv")
# lots of missing data!!!!!!!!!!!!!!!
# pprint(planetData.isnull().sum())


features = ['PlanetaryMassJpt', 'RadiusJpt', 'PeriodDays', 'SemiMajorAxisAU', 'Eccentricity',
            'SurfaceTempK', 'HostStarMassSlrMass', 'HostStarRadiusSlrRad',
            'HostStarMetallicity', 'HostStarTempK', 'HostStarAgeGyr']

matrix = planetData[features].dropna()

pprint(matrix.to_csv("../Analysis/corr-data/corr.csv"))
pprint(matrix.to_csv("../Analysis/corr-data/scatter.csv"))
