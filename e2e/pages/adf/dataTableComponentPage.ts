/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { browser, by, element, protractor } from 'protractor';
import { Util } from '../../util/util';
import { ElementFinder, ElementArrayFinder } from 'protractor/built/element';

export class DataTableComponentPage {

    rootElement: ElementFinder;
    list: ElementArrayFinder;
    contents = element.all(by.css('div[class="adf-datatable-body"] span'));
    table = element.all(by.css('adf-datatable')).first();
    tableBody = element.all(by.css(`div[class='adf-datatable-body']`)).first();
    spinner = element(by.css('mat-progress-spinner'));
    rows = by.css(`adf-datatable div[class*='adf-datatable-body'] div[class*='adf-datatable-row']`);
    allColumns = element.all(by.css('div[data-automation-id*="auto_id_entry."]'));
    selectedRowNumber = element(by.css(`div[class*='is-selected'] div[data-automation-id*='text_']`));
    allSelectedRows = element.all(by.css(`div[class*='is-selected']`));
    selectAll = element(by.css(`div[class*='header'] mat-checkbox`));

    constructor(rootElement: ElementFinder = element.all(by.css('adf-datatable')).first()) {
        this.rootElement = rootElement;
        this.list = this.rootElement.all(by.css(`div[class*='adf-datatable-body'] div[class*='adf-datatable-row']`));
    }

    checkAllRowsButtonIsDisplayed() {
        Util.waitUntilElementIsVisible(this.selectAll);
        return this;
    }

    checkAllRows() {
        Util.waitUntilElementIsClickable(this.selectAll);
        this.selectAll.click();
    }

    clickCheckbox(columnName, columnValue) {
        let checkbox = this.getRow(columnName, columnValue).element(by.xpath(`ancestor::div[contains(@class, 'adf-datatable-row')]//mat-checkbox/label`));
        Util.waitUntilElementIsVisible(checkbox);
        checkbox.click();
    }

    checkRowIsNotChecked(columnName, columnValue) {
        Util.waitUntilElementIsNotOnPage(this.getRowCheckbox(columnName, columnValue));
    }

    checkRowIsChecked(columnName, columnValue) {
        Util.waitUntilElementIsVisible(this.getRowCheckbox(columnName, columnValue));
    }

    getRowCheckbox(columnName, columnValue) {
        return this.getRow(columnName, columnValue).element(by.xpath(`ancestor::div/div/mat-checkbox[contains(@class, 'mat-checkbox-checked')]`));
    }

    checkNoRowIsSelected() {
        Util.waitUntilElementIsNotOnPage(this.selectedRowNumber);
    }

    getNumberOfSelectedRows() {
        return this.allSelectedRows.count();
    }

    selectRowWithKeyboard(columnName, columnValue) {
        let row = this.getRow(columnName, columnValue);
        browser.actions().sendKeys(protractor.Key.COMMAND).click(row).perform();
    }

    selectRow(columnName, columnValue) {
        let row = this.getRow(columnName, columnValue);
        Util.waitUntilElementIsClickable(row);
        row.click();
        this.checkRowIsSelected(columnName, columnValue);
        return this;
    }

    checkRowIsSelected(columnName, columnValue) {
        let selectedRow = this.getRow(columnName, columnValue).element(by.xpath(`ancestor::div[contains(@class, 'is-selected')]`));
        Util.waitUntilElementIsVisible(selectedRow);
        return this;
    }

    checkRowIsNotSelected(columnName, columnValue) {
        let selectedRow = this.getRow(columnName, columnValue).element(by.xpath(`ancestor::div[contains(@class, 'is-selected')]`));
        Util.waitUntilElementIsNotOnPage(selectedRow);
        return this;
    }

    getColumnValueForRow(identifyingColumn, identifyingValue, columnName) {
        let row = this.getRow(identifyingColumn, identifyingValue).element(by.xpath(`ancestor::div[contains(@class, 'adf-datatable-row')]`));
        Util.waitUntilElementIsVisible(row);
        let rowColumn = row.element(by.css(`div[title="${columnName}"] span`));
        Util.waitUntilElementIsVisible(rowColumn);
        return rowColumn.getText();
    }

    /**
     * Check the list is sorted.
     *
     * @param sortOrder: 'true' if the list is expected to be sorted ascendant and 'false' for descendant
     * @param locator: locator for column
     * @return 'true' if the list is sorted as expected and 'false' if it isn't
     */
    checkListIsSorted(sortOrder, locator) {
        let deferred = protractor.promise.defer();
        let column = element.all(by.css(`div[class*="adf-data-table-cell"][title="${locator}"] span`));
        Util.waitUntilElementIsVisible(column.first());
        let initialList = [];
        column.each(function (currentElement) {
            currentElement.getText().then(function (text) {
                initialList.push(text);
            });
        }).then(function () {
            let sortedList = initialList;
            sortedList = sortedList.sort();
            if (sortOrder === false) {
                sortedList = sortedList.reverse();
            }
            deferred.fulfill(initialList.toString() === sortedList.toString());
        });
        return deferred.promise;
    }

    rightClickOnRow(columnName, columnValue) {
        let row = this.getRow(columnName, columnValue);
        browser.actions().click(row, protractor.Button.RIGHT).perform();
        Util.waitUntilElementIsVisible(element(by.id('adf-context-menu-content')));
    }

    getTooltip(columnName, columnValue) {
        return this.getRow(columnName, columnValue).element(by.css('span')).getAttribute('title');
    }

    getFileHyperlink(filename) {
        return element(by.cssContainingText('adf-name-column[class*="adf-datatable-link"] span', filename));
    }

    numberOfRows() {
        return this.rootElement.all(this.rows).count();
    }

    async getAllRowsColumnValues(column) {
        let columnLocator = by.css("adf-datatable div[class*='adf-datatable-body'] div[class*='adf-datatable-row'] div[title='" + column + "'] span");
        Util.waitUntilElementIsVisible(element.all(columnLocator).first());
        let initialList = await element.all(columnLocator).getText();
        return initialList.filter((el) => el);
    }

    async getRowsWithSameColumnValues(columnName, columnValue) {
        let columnLocator = by.css(`div[title='${columnName}'] div[data-automation-id="text_${columnValue}"] span`);
        Util.waitUntilElementIsVisible(element.all(this.rows).all(columnLocator).first());
        let initialList = await element.all(this.rows).all(columnLocator).getText();
        return initialList.filter((el) => el);
    }

    doubleClickRow(columnName, columnValue) {
        let row = this.getRow(columnName, columnValue);
        Util.waitUntilElementIsVisible(row);
        Util.waitUntilElementIsClickable(row);
        row.click();
        this.checkRowIsSelected(columnName, columnValue);
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        return this;
    }

    waitForTableBody() {
        Util.waitUntilElementIsVisible(this.tableBody);
    }

    getFirstElementDetail(detail) {
        let firstNode = element.all(by.css(`adf-datatable div[title="${detail}"] span`)).first();
        return firstNode.getText();
    }

    sortByColumn(sortOrder, column) {
        let locator = by.css(`div[data-automation-id="auto_id_${column}"]`);
        Util.waitUntilElementIsVisible(element(locator));
        return element(locator).getAttribute('class').then(function (result) {
            if (sortOrder === true) {
                if (!result.includes('sorted-asc')) {
                    if (result.includes('sorted-desc') || result.includes('sortable')) {
                        element(locator).click();
                    }
                }
            } else {
                if (result.includes('sorted-asc')) {
                    element(locator).click();
                } else if (result.includes('sortable')) {
                    element(locator).click();
                    element(locator).click();
                }
            }

            return Promise.resolve();
        });
    }

    checkContentIsDisplayed(columnName, columnValue) {
        let row = this.getRow(columnName, columnValue);
        Util.waitUntilElementIsVisible(row);
        return this;
    }

    checkContentIsNotDisplayed(columnName, columnValue) {
        let row = this.getRow(columnName, columnValue);
        Util.waitUntilElementIsNotVisible(row);
        return this;
    }

    contentInPosition(position) {
        Util.waitUntilElementIsVisible(this.contents);
        return this.contents.get(position - 1).getText();
    }

    getRowParentElement(columnName, columnValue) {
        let row = this.rootElement.all(by.css(`div[title="${columnName}"] div[data-automation-id="text_${columnValue}"]`)).first()
            .element(by.xpath(`ancestor::div[contains(@class, 'adf-datatable-row')]`));
        Util.waitUntilElementIsVisible(row);
        return row;
    }

    getRow(columnName, columnValue) {
        return this.rootElement.all(by.css(`div[title="${columnName}"] div[data-automation-id="text_${columnValue}"]`)).first();
    }

    checkSpinnerIsDisplayed() {
        Util.waitUntilElementIsPresent(this.spinner);
        return this;
    }

    checkSpinnerIsNotDisplayed() {
        Util.waitUntilElementIsNotOnPage(this.spinner);
        return this;
    }

    tableIsLoaded() {
        Util.waitUntilElementIsVisible(this.table);
        return this;
    }

    checkColumnIsDisplayed(column) {
        Util.waitUntilElementIsVisible(element(by.css(`div[data-automation-id="auto_id_entry.${column}"]`)));
        return this;
    }

    getNumberOfColumns() {
        return this.allColumns.count();
    }

    getNumberOfRows() {
        return this.list.count();
    }

    getCellByRowAndColumn(rowColumn, rowContent, columnName) {
        return this.getRowParentElement(rowColumn, rowContent).element(by.css(`div[title='${columnName}']`));
    }
}
