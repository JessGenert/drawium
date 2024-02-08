## [https://www.drawium.lol](https://www.drawium.lol)

This started as a passion project for me in order to learn React. I ended up learning way more in the process than I could have ever imagined.
This is built on a MERN stack MongoDB, Express, React, and Nodejs. But I use many more technologies and libraries. It is done using functional components.
It is fully responsive and mobile friendly as well as cross platform play. My only two regrets were not taking advantage of Bootstraps built in functionality more
and not doing it in Typescript for the practice. 
Also honourable mention is React's new documentation. It is wonderful and would have been nice to have over the class component documentation I had to scour for answers for hours on end.

### Here is a rundown of what I use:
- AWS
- EC2 (to host my Ubuntu distro)
- S3 Bucket (to store discord user drawings)
- Ubuntu 20.04
- nginx (my web server and proxy pass for my api and sockets)
- certbot (for creating my SSL certs)
- socket.io (for my websockets. Bless them and their amazing documentation)
- mongoose (for my ODM)
- securels (so I didn't need to have sessions or cookies as I store basic info - just secure enugh to not play as other players)
- axios (I know fetch is built into the mdn now but I just love axios so much more)
- uuid (to keep rooms unique and games/drawings unique across playthroughs)
- bootstrap (because who doesn't love bootstrap. though in hindsight I should have utilized it a bit more)

# Now to get into what it's all about:

## Homepage:
![](https://i.imgur.com/ojzyI8i.png)  ![](https://i.imgur.com/XCBnzdq.png) 

## When you click Discord login, you are taken to an Oauth2 login:
![](https://i.imgur.com/R69Lqui.png)   ![](https://i.imgur.com/ZGzw5IJ.png)


## If you authorize, you are logged in using securels which stores your userid, avatar, and username securely in local storage and are taken to the lobby
## (I didn't want to use sessions or cookies for this site as nothing is really secret about the information I am storing)

![](https://i.imgur.com/ok9sQAe.png)    ![](https://i.imgur.com/yYJ88x7.png)


## On Mobile you can select either create a game or a game from the drop down list. If you select a game it tells you who is all in that game.


![](https://i.imgur.com/GfUHKsT.png) ![](https://i.imgur.com/xINyZIb.png)

## On Desktop it is somewhat similar with the games appearing as they are created and if you click on a game in the list it shows you who is in that game currently.
![](https://i.imgur.com/03VWgk8.png) ![](https://i.imgur.com/HZ0Hmxa.png)

## The games list is updated automatically when someone creates a game. The new list is displayed to all currently connected clients. 
## If someone leaves a game it is reflected in the list of players for that game and if everyone leaves the game, the game is removed from the list

## Joining the game, the player table is also dynamically updated for everyone at all times
![](https://i.imgur.com/STkF8P8.png)  ![](https://i.imgur.com/aom2imz.png)

## The first person in the game has the option to choose the amount of rounds (up to 6) and start the game

![](https://i.imgur.com/rZrxguC.png) ![](https://i.imgur.com/vIHeShH.png)

## When the game starts it goes from first in line to last for drawing turns. You get the option to choose from 3 words

![](https://i.imgur.com/xzD4D5X.png)  ![](https://i.imgur.com/mRMSclP.png)

## Letters are revealed based of of letter count and time remaining and instead of a drawing group you are given a guess box to guess the word
## here is an example of a drawing group for both versions:

![](https://i.imgur.com/S9xhGfr.png)  ![](https://i.imgur.com/j25lAG0.png) ![](https://i.imgur.com/ED08eCG.png)

## Scoring is based on time left
![](https://i.imgur.com/h43Kq1P.png)

## Drawing is done in real time for all players

![](https://i.imgur.com/W1q491P.gif)


## You can search for players profiles to see their stats and drawing gallery clicking on an image allows you to download it.
## disclaimer: I am still getting a few errors when it comes to uploading my img blobs to the s3 bucket.

![](https://i.imgur.com/Z5w8Fpp.png)  ![](https://i.imgur.com/IkGJnKm.png)  ![](https://i.imgur.com/dvDiszS.png)
