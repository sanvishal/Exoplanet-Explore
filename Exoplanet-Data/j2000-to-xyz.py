from math import cos, sin, degrees, radians
import pandas as pd


def num(n):
    try:
        return int(n)
    except ValueError:
        return float(n)


planetData = pd.read_csv("original-data/planets.csv")
print(" >> original csv read...")

features = ['PlanetIdentifier', 'RightAscension',
            'Declination', 'DistFromSunParsec']

data = planetData[features].dropna()

name_list = data['PlanetIdentifier'].tolist()
ra_list = data['RightAscension'].tolist()
dec_list = data['Declination'].tolist()
dist_list = data['DistFromSunParsec'].tolist()

print(" >> processing csv...")
result = []

for i in range(len(ra_list)):
    ra = ra_list[i]
    dec = dec_list[i]
    dist_parsec = dist_list[i]

    ra = list(map(num, ra.split()))
    dec_sign = int(dec[0] + "1")
    dec = list(map(num, dec.split()))

    a = radians((ra[0]*15) + (ra[1]*0.25) + (ra[2]*0.004166))
    b = radians((abs(dec[0]) + (dec[1] / 60) + (dec[2] / 3600)) * dec_sign)
    c = dist_parsec

    x = (c * cos(b)) * cos(a)
    y = (c * cos(b)) * sin(a)
    z = c * sin(b)

    result.append([name_list[i], name_list[i]
                   [:len(name_list[i])-2], x, y, z, dist_list[i]])

print(" >> ra/dec to cartesian converted")
res_csv = pd.DataFrame(
    result, columns=['PlanetIdentifier', 'SystemName', 'x', 'y', 'z', 'DistFromSunParsec'])
res_csv.sort_values('DistFromSunParsec', inplace=True)
res_csv.to_csv("../Analysis/public/cartesian-data/cart.csv")
print("\033[1m"+" >> csv exported to public/cartesian-data"+"\033[0m")
