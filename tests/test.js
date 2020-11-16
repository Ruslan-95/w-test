const locator = require('../helpers/locator.js');

Feature('SQL auto-tests.');
/**
 * 1. Вывести все строки таблицы *Customers* и убедиться, что запись с ContactName равной ‘Giovanni Rovelli’ имеет Address = ‘Via Ludovico il Moro 22’.
 */
Scenario('**Customers* & ContactName = \'Giovanni Rovelli\'', async (I) => {
    I.amOnPage("/sql/trysql.asp?filename=trysql_select_all");
    let mySql = "SELECT *\n" +
        "FROM Customers;";
    sqlRequest(mySql);
    I.waitForElement(locator.table, 10);

    let htm_arr = (await I.grabHTMLFrom(locator.table)).match(/<tr>(.*?)<\/tr>/g);

    I.say("Form an array of column names");
    let columnName_arr = htm_arr[0].match(/<th>(.*?)<\/th>/g);
    let item_ContactName, item_Address, findStr;
    columnName_arr.forEach(function (str, i) {
        if (str.indexOf("ContactName") !== -1) {
            item_ContactName = i;
        }
        if (str.indexOf("Address") !== -1) {
            item_Address = i;
        }
    });

    I.say("Looking for a substring in array of strings");
    let str_name = "Giovanni Rovelli";
    let str_address = "Via Ludovico il Moro 22";
    htm_arr.forEach(function (str, i) {
        if (str.indexOf(str_name) !== -1) {
            findStr = true;
            if (htm_arr[i].match(/<td>(.*?)<\/td>/g)[item_ContactName].indexOf(str_name) === -1 ||
                htm_arr[i].match(/<td>(.*?)<\/td>/g)[item_Address].indexOf(str_address) === -1) {
                throw new Error("ContactName '" + str_name + "' <> Address '" + str_address + "'");
            }
        }
    });
});

/**
 *  2. Вывести только те строки таблицы *Customers*, где city=‘London’. Проверить, что в таблице ровно 6 записей.
 */
Scenario("city = 'London'", async (I) => {
    I.amOnPage("/sql/trysql.asp?filename=trysql_select_all");
    let mySql = "SELECT *\n" +
        "FROM Customers\n" +
        "WHERE City = 'London';";
    sqlRequest(mySql);
    I.waitForElement(locator.table, 10);
    I.see("Number of Records: 6", locator.numberOfRecords_text);
    let htm_arr = (await I.grabHTMLFrom(locator.table)).match(/<tr>(.*?)<\/tr>/g);
    if (htm_arr.length !== 7) {
        throw new Error("Incorrect count records in table. Expected 6 entries. Total count = " + (htm_arr.length - 1));
    }

    I.say("Check column 'City' in table");
    let columnName_arr = htm_arr[0].match(/<th>(.*?)<\/th>/g);
    let item_City;
    columnName_arr.forEach(function (str, i) {
        if (str.indexOf("City") !== -1) {
            item_City = i;
            htm_arr.splice(0, 1);
        }
    });
    if (!item_City) {
        throw new Error("Can't find required columns in the table");
    }

    I.say("Check City eque only 'London'");
    htm_arr.forEach(function (str, i) {
        if (htm_arr[i].match(/<td>(.*?)<\/td>/g)[item_City].indexOf("London") === -1) {
            throw new Error("City <> 'London'. Rows error = " + i);
        }
    });
});

/**
 * 3. Добавить новую запись в таблицу *Customers* и проверить, что эта запись добавилась.
 */
Scenario("INSERT", async (I) => {
    I.amOnPage("/sql/trysql.asp?filename=trysql_select_all");
    let myData = ['Testing Customer', 'Some Name', 'Some City', 'Some Street', '0007', 'Some Country']
    let mySql = `INSERT INTO Customers('CustomerName', 'ContactName', 'Address', 'City', 'PostalCode', 'Country')\n` +
        `VALUES ('${myData[0]}', '${myData[1]}', '${myData[2]}', '${myData[3]}', '${myData[4]}', '${myData[5]}');`;
    sqlRequest(mySql);
    I.waitForElement(locator.databaseChanges_text, 10);
    I.see("You have made changes to the database. Rows affected: 1", locator.databaseChanges_text);
    mySql = "SELECT *\n" +
        "FROM Customers\n" +
        "WHERE City = 'Some City' AND ContactName = 'Some Name';";
    sqlRequest(mySql);
    I.waitForElement(locator.table, 10);
    I.see("Number of Records: 1", locator.numberOfRecords_text);
    I.say("Сheck the added record");
    let htm_arr = (await I.grabHTMLFrom(locator.table)).match(/<tr>(.*?)<\/tr>/g);
    myData.forEach(function (str, i) {
        if (htm_arr[1].match(/<td>(.*?)<\/td>/g)[i + 1].indexOf(myData[i]) === -1) {
            throw new Error("Added record error");
        }
    })
});

/**
 *  4. Обновить все поля (кроме CustomerID) в любой записи таблицы *Customers*и проверить, что изменения записались в базу.
 */
Scenario("UPDATE all fields.", async (I) => {
    I.amOnPage("/sql/trysql.asp?filename=trysql_select_all");
    let myData = ['Testing UPDATE', new Date().getTime(), 'Street UPDATE', 'limassol_update', '1', 'NEW']
    let mySql = "UPDATE Customers\n" +
        `SET CustomerName = '${myData[0]}', ContactName = '${myData[1]}', Address = '${myData[2]}', City = '${myData[3]}', ` +
        ` PostalCode = '${myData[3]}', PostalCode = '${myData[4]}', Country = '${myData[5]}'\n` +
        "WHERE CustomerID = 13;";
    sqlRequest(mySql);
    I.waitForElement(locator.databaseChanges_text, 10);
    I.see("You have made changes to the database. Rows affected: 1", locator.databaseChanges_text);
    mySql = "SELECT *\n" +
        "FROM Customers\n" +
        "WHERE CustomerID = 13;";
    sqlRequest(mySql);
    I.waitForElement(locator.table, 10);
    I.see("Number of Records: 1", locator.numberOfRecords_text);
    I.say("Сheck update fields");
    let htm_arr = (await I.grabHTMLFrom(locator.table)).match(/<tr>(.*?)<\/tr>/g);
    myData.forEach(function (str, i) {
        if (htm_arr[1].match(/<td>(.*?)<\/td>/g)[i + 1].indexOf(myData[i]) === -1) {
            throw new Error("Added record error");
        }
    })
});

/**
 * 5. Клик по первой ссылке в правой табличке "Your Database"
 */
Scenario("Click to 'YourTD' table", async (I) => {
    I.amOnPage("/sql/trysql.asp?filename=trysql_select_all");
    I.click(locator.firstTdInYourDBTable, 10);
    I.see("Number of Records: 91", locator.numberOfRecords_text);
});
function sqlRequest(mySql) {
    I = require('../steps_file.js')()
    I.click(locator.req);
    I.pressKey(['Control', 'a']);
    I.pressKey('Backspace');
    mySql.split('').forEach(function (item) {
        I.pressKey(item);
    });
    I.click(locator.submitBtn);
}