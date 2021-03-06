/**
 * Get the row ID where new data should be inserted based on provided date
 * @param date 
 * @returns 
 */
function getInsertionRow(date) {
    const ledger = getLedger();
    const range = ledger.getDataRange().getValues();
    for(var row = range.length - 1; row >= 1; row--) {
      if(isBefore(convertDateToMidnight(range[row][0]), date)) {
        return row+2;
      }
    }
    return ledger.getLastRow();
}

/**
 * 
 * @param date 
 * @returns 
 */
function getLastBalanceOfMonth(date) {
    if(isEmpty(getLedger())) {
      return 0;
    }
    const lastDateOfMonth = getEndOfMonth(date);
    const range = getLedger().getDataRange().getValues();
    var lastSeenBalance = range[range.length-1][3];
    for(var i = range.length; i < range.length; i++) {
      if(isAfter(convertDateToMidnight(range[i][0]), date)) {
         return lastSeenBalance;
      }
      lastSeenBalance = range[i][3];
    }
    return lastSeenBalance;
}

/**
 * Returns the data for the given year and month in the format:
 * Array<
 *   {
 *     date: moment;
 *     row: number;
 *     type: 'Starting Balance' | 'Withdrawal' | 'Deposit' | 'Interest';
 *     delta: number;
 *     balance: number;
 *   }
 * >
 * @param year 
 * @param month 
 * @returns 
 */
function getLinesForMonth(year, month) {
    const dateRange = getMonthRange(year, month);
    const lines = [];
    const range = getLedger().getDataRange().getValues();
    var date = null;
    for(var i = Constants.LedgerRow.FIRST_DATA_ROW - 1; i<range.length; i++) {
      date = convertDateToMidnight(range[i][0]);
      if(!(isBefore(date, dateRange.start) || isAfter(date, dateRange.end))) {
        lines.push({
          date: date,
          row: i+1,
          type: range[i][1],
          delta: range[i][2],
          balance: range[i][3]
        });
      }
      if(isAfter(date, dateRange.end)) {
        break;
      }
    }
    return lines;
}

/**
 * Shift data down one row starting at firstRow
 * @param firstRow 
 */
function shiftLinesDown(firstRow) {
    const ledger = getLedger();
    const numRows = getLastDataRow(ledger) - firstRow + 1;
    const srcRange = ledger.getRange(firstRow, 1, numRows, Constants.NUM_DATA_COLUMNS);
    const destRange = ledger.getRange(firstRow + 1, 1, numRows, Constants.NUM_DATA_COLUMNS);
    srcRange.copyTo(destRange);
    ledger.getRange(firstRow, 1, 1, Constants.NUM_DATA_COLUMNS).clearContent();
}
