from bs4 import BeautifulSoup
import urllib2
import random


if __name__ == '__main__':


    password = "jhhazlBoiazjehb3wgPSnzCnQeoD.JOwIZ56wrQ5AImi5z1F2dgGGIMeAF1W"
    startingMoney = 500
    mailingAdresse = ['gmail','hotmail','yahoo','outlook']
    nameDict = dict()

    for i in range(0,75):
        response = urllib2.urlopen('http://namegenerators.org/random-username-generator/')
        html = response.read()


        soup = BeautifulSoup(html,"html.parser")
        mydivs = soup.findAll("div", { "class" : "bizname" })
        totalNew = 0
        for divs in mydivs:
            currentDiv = BeautifulSoup(str(divs),"html.parser")
            newName = currentDiv.div.string
            if newName not in nameDict:
                if len(nameDict) < 3000:
                    nameDict[newName] = newName
                    totalNew += 1



    nameList = list(nameDict.values())

    print("INSERT INTO users VALUES")
    NUSER = 1000
    for x in range(0,len(nameList)):

        monthInt = random.randint(1,12)
        dayInt = random.randint(1,28)
        year = random.randint(1980,2004)
        mail = random.choice(mailingAdresse)

        if monthInt < 10:
            month = '0' + str(monthInt)
        else:
            month = monthInt

        if(dayInt < 10):
            day = '0' + str(dayInt)
        else:
            day = dayInt


        if(x == len(nameList)-1):

            print("('{0}','{0}','{1}','{0}@{6}.com',{7},'{3}-{4}-{5}');".format(nameList[x],password,startingMoney,year,month,day,mail,startingMoney))
        else:
            print("('{0}','{0}','{1}','{0}@{6}.com',{7},'{3}-{4}-{5}'),".format(nameList[x],password,startingMoney,year,month,day,mail,startingMoney))
