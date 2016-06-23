
from bs4 import BeautifulSoup
import urllib2

nameList = dict()

for i in range(0,200):
    response = urllib2.urlopen('http://namegenerators.org/random-username-generator/')
    html = response.read()


    soup = BeautifulSoup(html,"html.parser")
    mydivs = soup.findAll("div", { "class" : "bizname" })
    totalNew = 0
    for divs in mydivs:
        currentDiv = BeautifulSoup(str(divs),"html.parser")
        newName = currentDiv.div.string
        if newName not in nameList:
            nameList[newName] = newName
            totalNew += 1
    print("Total new = " + str(totalNew))
#print(list(nameList))
print(len(nameList))
