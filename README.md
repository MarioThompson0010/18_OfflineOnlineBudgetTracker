# 18_OfflineOnlineBudgetTracker


List of technologies and methodologies used:  npm, Javascript, Heroku, PWA, cached storage


This application tracks your debits and credits.

On your local machine, open up a browser and press F12.  Clear all the cache.  
Do this by selecting the Application tab.  Select Storage, on the left hand side, near the top.  Now click "Clear site data". Close F12.

From your terminal, type "node server.js".  Go to localhost:3000. Press F5 to refresh.  Store a couple of transactions. These will be stored to the database.  Now press F12.  On the Application tab, click on "Service Workers".  Put yourself in offline mode by checking the Offline checkbox.  Do a couple more transactions.  Now uncheck the Offline checkbox.  The transactions you did are now stored to the database.  Verify this by pressing F5.

## How to test this app

Follow the steps above to run the program.  Go to Robo 3T to verify that everything got stored, even the offline transactions that you did.

