## Refactoring and Updates

[GAS - How to send email contains multiple rows of data](https://groups.google.com/g/google-apps-script-community/c/MXzmVpWtHTE/m/PWgT7BAiAwAJ)

```js
function HLReminderAtYE() {
  const SS = SpreadsheetApp.getActiveSpreadsheet(); // declare the spreadsheet
  const Sheet = SS.getSheetByName('Tax_Master'); // declare sheet name
  const Range = Sheet.getDataRange(); // to set the range as array
  const Values = Range.getDisplayValues(); // to get the value in the array

  // filter only housecontract to remind at year end
  const fvs = Values.filter(function (item) {
    return item[13] == 'Y';
  })
    // create a group object for an each valid Co name entry
    .reduce((a, r) => {
      const key = r[0];
      if (key) {
        if (a[key]) a[key].data.push(r);
        else a[key] = { data: [r] };
      }
      return a;
    }, {});

  const templateText = SS.getSheetByName('Template').getRange(1, 1).getValue();

  // Iterate through the group object
  Object.keys(fvs).forEach(function (key) {
    const messageBody = []; // For the main body
    const firstEntry = fvs[key].data[0]; // For the mail sender
    // Iterate through the group item data
    fvs[key].data.forEach((row) => {
      const AssigneeNames = row[1];
      const ClientNames = row[0];
      const HLEndDates = row[7];
      messageBody.push(
        templateText
          .replace('{ClientNames}', ClientNames)
          .replace('{AssigneeNames}', AssigneeNames)
          .replace('{HouseleaseEndDates}', HLEndDates)
      );
    });
    MailApp.sendEmail(
      firstEntry[12], // email address
      firstEntry[0] + '- House lease contract expire', // Subject line
      messageBody.join('\n')
    );
  });
}
```
