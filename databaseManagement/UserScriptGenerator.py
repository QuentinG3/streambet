
if __name__ == '__main__':
    print("INSERT INTO users VALUES")
    NUSER = 1000
    for x in range(0,NUSER):
        if(x == NUSER-1):
            print("('user"+str(x)+"','user"+str(x)+"','anus','user"+str(x)+"@gmail.com',500,'1994-02-02');")
        else:
            print("('user"+str(x)+"','user"+str(x)+"','anus','user"+str(x)+"@gmail.com',500,'1994-02-02'),")
