import { SettingsPage } from '../../pages/adf/settingsPage';
import { ContentServicesPage } from '../../pages/adf/contentServicesPage';
import TestConfig = require('../../test.config');
import { browser } from 'protractor';
import { NavigationBarPage } from '../../pages/adf/navigationBarPage';
import { LoginSSOPage } from '../../pages/adf/loginSSOPage';
import { UploadActions } from "../../actions/ACS/upload.actions";
import { FileModel } from "../../models/ACS/fileModel";
import { ContentListPage } from '../../pages/adf/dialog/contentListPage';
import { ViewerPage } from '../../pages/adf/viewerPage';
import { LoginPage } from '../../pages/adf/loginPage';
import resources = require('../../util/resources');
import AlfrescoApi = require('alfresco-js-api-node');
import * as path from "path";
import {Util} from "../../util/util";

describe('SSO in ADF using ACS and AIS, Download Directive, Viewer, DocumentList', () => {

    let settingsPage = new SettingsPage();
    let navigationBarPage = new NavigationBarPage();
    let contentServicesPage = new ContentServicesPage();
    let contentListPage = new ContentListPage();
    let loginSsoPage = new LoginSSOPage();
    let viewerPage = new ViewerPage();
    let loginPage = new LoginPage();
    let silentLogin;
    let implicitFlow;
    let uploadActions = new UploadActions();
    let firstPdfFileModel = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PDF_B.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PDF_B.file_location
    });

    let pngFileModel = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PNG.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PNG.file_location
    });

    let pdfUploadedFile, pngUploadedFile, folder;

    this.alfrescoJsApi = new AlfrescoApi({
        provider: 'ECM',
        hostEcm: TestConfig.adf.url
    });
    let downloadedPngFile = path.join(__dirname, 'downloads', pngFileModel.name);
    let downloadedMultipleFiles = path.join(__dirname, 'downloads', 'archive.zip');

    describe('SSO in ADF using ACS and AIS, implicit flow set', () => {

    beforeAll(async(done) => {
        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        folder = await uploadActions.createFolder(this.alfrescoJsApi, 'TestSSO', '-my-');

        pdfUploadedFile = await uploadActions.uploadFile(this.alfrescoJsApi, firstPdfFileModel.location, firstPdfFileModel.name, folder.entry.id);

        pngUploadedFile = await uploadActions.uploadFile(this.alfrescoJsApi, pngFileModel.location, pngFileModel.name, folder.entry.id);

        silentLogin = false;
        implicitFlow = true;
        settingsPage.setProviderEcmSso(TestConfig.adf.hostECM, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity, silentLogin, implicitFlow);
        loginSsoPage.clickOnSSOButton();
        loginSsoPage.loginAPS(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
        navigationBarPage.clickContentServicesButton();
        contentServicesPage.checkAcsContainer();
        contentListPage.navigateToFolder('TestSSO');
        contentListPage.waitForTableBody();
        done();
    });

    afterAll(async (done) => {
        try {
            await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
            await uploadActions.deleteFilesOrFolder(this.alfrescoJsApi, folder.entry.id);
        } catch (error) {
        }
        await this.alfrescoJsApi.logout();
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
        done();
    });

    afterEach(async(done) => {
        browser.refresh();
        contentListPage.waitForTableBody();
        done();
    });

    it('[C291936] Should be able to download a file', async(done) => {

        contentListPage.clickRowToSelect(firstPdfFileModel.name);
        contentServicesPage.clickDownloadButton();
        browser.driver.sleep(1000);
        expect(Util.fileExists(downloadedPngFile, 30)).toBe(true);
        done();
    });

    it('[C291938] Should be able to open a document', async(done) => {

        contentListPage.doubleClickRow(firstPdfFileModel.name);
        viewerPage.checkFileIsLoaded();
        viewerPage.checkFileNameIsDisplayed(firstPdfFileModel.name);
        viewerPage.clickCloseButton();
        contentListPage.waitForTableBody();
        done();
    });

    it('[C291942] Should be able to open an image', async(done) => {

        viewerPage.viewFile(pngFileModel.name);
        viewerPage.checkImgViewerIsDisplayed();
        viewerPage.checkFileNameIsDisplayed(pngFileModel.name);
        viewerPage.clickCloseButton();
        contentListPage.waitForTableBody();
        done();
    });

    it('[C291941] Should be able to download multiple files', async(done) => {

        contentServicesPage.clickMultiSelectToggle();
        contentServicesPage.checkAcsContainer();
        contentListPage.clickAllRowsCheckbox();
        contentServicesPage.clickDownloadButton();
        browser.driver.sleep(1000);
        expect(Util.fileExists(downloadedMultipleFiles, 30)).toBe(true);
        done();
    });

    it('[C291940] Should be able to view thumbnails when enabled', async(done) => {

        contentServicesPage.enableThumbnails();
        contentServicesPage.checkAcsContainer();
        contentListPage.waitForTableBody();
        let filePdfIconUrl = await contentServicesPage.getRowIconImageUrl(firstPdfFileModel.name);
        expect(filePdfIconUrl).toContain(`/versions/1/nodes/${pdfUploadedFile.entry.id}/renditions`);
        let filePngIconUrl = await contentServicesPage.getRowIconImageUrl(pngFileModel.name);
        expect(filePngIconUrl).toContain(`/versions/1/nodes/${pngUploadedFile.entry.id}/renditions`);
        done();
    });

});

describe('SSO in ADF using ACS and AIS, implicit flow unset', () => {

    beforeAll(async(done) => {
        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        folder = await uploadActions.createFolder(this.alfrescoJsApi, 'TestSSO', '-my-');

        pdfUploadedFile = await uploadActions.uploadFile(this.alfrescoJsApi, firstPdfFileModel.location, firstPdfFileModel.name, folder.entry.id);

        pngUploadedFile = await uploadActions.uploadFile(this.alfrescoJsApi, pngFileModel.location, pngFileModel.name, folder.entry.id);

        silentLogin = false;
        implicitFlow = false;
        settingsPage.setProviderEcmSso(TestConfig.adf.hostECM, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity, silentLogin, implicitFlow);
        loginPage.waitForElements();
        loginPage.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
        navigationBarPage.clickContentServicesButton();
        contentServicesPage.checkAcsContainer();
        contentListPage.navigateToFolder('TestSSO');
        contentListPage.waitForTableBody();
        done();
    });

    afterAll(async (done) => {
        try {
            await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
            await uploadActions.deleteFilesOrFolder(this.alfrescoJsApi, folder.entry.id);
        } catch (error) {
        }
        await this.alfrescoJsApi.logout();
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
        done();
    });

    afterEach(async(done) => {
        browser.refresh();
        contentListPage.waitForTableBody();
        done();
    });

    it('[C291936] Should be able to download a file', async(done) => {

        contentListPage.clickRowToSelect(firstPdfFileModel.name);
        contentServicesPage.clickDownloadButton();
        browser.driver.sleep(1000);
        expect(Util.fileExists(downloadedPngFile, 30)).toBe(true);
        done();
    });

    it('[C291938] Should be able to open a document', async(done) => {

        contentListPage.doubleClickRow(firstPdfFileModel.name);
        viewerPage.checkFileIsLoaded();
        viewerPage.checkFileNameIsDisplayed(firstPdfFileModel.name);
        viewerPage.clickCloseButton();
        contentListPage.waitForTableBody();
        done();
    });

    it('[C291942] Should be able to open an image', async(done) => {

        viewerPage.viewFile(pngFileModel.name);
        viewerPage.checkImgViewerIsDisplayed();
        viewerPage.checkFileNameIsDisplayed(pngFileModel.name);
        viewerPage.clickCloseButton();
        contentListPage.waitForTableBody();
        done();
    });

    it('[C291941] Should be able to download multiple files', async(done) => {

        contentServicesPage.clickMultiSelectToggle();
        contentServicesPage.checkAcsContainer();
        contentListPage.clickAllRowsCheckbox();
        contentServicesPage.clickDownloadButton();
        browser.driver.sleep(1000);
        expect(Util.fileExists(downloadedMultipleFiles, 30)).toBe(true);
        done();
    });

    it('[C291940] Should be able to view thumbnails when enabled', async(done) => {

        contentServicesPage.enableThumbnails();
        contentServicesPage.checkAcsContainer();
        contentListPage.waitForTableBody();
        let filePdfIconUrl = await contentServicesPage.getRowIconImageUrl(firstPdfFileModel.name);
        expect(filePdfIconUrl).toContain(`/versions/1/nodes/${pdfUploadedFile.entry.id}/renditions`);
        let filePngIconUrl = await contentServicesPage.getRowIconImageUrl(pngFileModel.name);
        expect(filePngIconUrl).toContain(`/versions/1/nodes/${pngUploadedFile.entry.id}/renditions`);
        done();
    });

});

});
