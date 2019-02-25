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

import TestConfig = require('../test.config');

import { LoginSSOPage } from '../pages/adf/loginSSOPage';
import { SettingsPage } from '../pages/adf/settingsPage';
import { NavigationBarPage } from '../pages/adf/navigationBarPage';
import { PeopleGroupCloudComponentPage } from '../pages/adf/demo-shell/process-services/peopleGroupCloudComponentPage';
import { PeopleCloudComponent } from '../pages/adf/process-cloud/peopleCloudComponent';
import { GroupCloudComponent } from '../pages/adf/process-cloud/groupCloudComponent';
import { browser } from 'protractor';
import { Identity } from '../actions/APS-cloud/identity';
import { GroupIdentity } from '../actions/APS-cloud/groupIdentity';
import CONSTANTS = require('../util/constants');

describe('People Groups CLoud Component', () => {

    describe('People Groups CLoud Component', () => {
        const settingsPage = new SettingsPage();
        const loginSSOPage = new LoginSSOPage();
        const navigationBarPage = new NavigationBarPage();
        const peopleGroupCloudComponentPage = new PeopleGroupCloudComponentPage();
        const peopleCloudComponent = new PeopleCloudComponent();
        const groupCloudComponent = new GroupCloudComponent();
        const identityService: Identity = new Identity();
        const groupIdentityService: GroupIdentity = new GroupIdentity();

        let silentLogin;
        let apsUser;
        let activitiUser;
        let noRoleUser ;
        let selectedPeople;
        let groupAps;
        let groupActiviti;
        let groupNoRole;
        let selectedGroups;

        beforeAll(async () => {
            await identityService.init(TestConfig.identity.adminUser, TestConfig.identity.adminPassword);
            apsUser = await identityService.createIdentityUser();
            await identityService.assignRole(apsUser.id, CONSTANTS.ROLES.APS_USER);
            activitiUser = await identityService.createIdentityUser();
            await identityService.assignRole(activitiUser.id, CONSTANTS.ROLES.ACTIVITI_USER);
            noRoleUser = await identityService.createIdentityUser();
            selectedPeople = [`${apsUser.firstName}` + ' ' + `${apsUser.lastName}`, `${activitiUser.firstName}` + ' ' + `${activitiUser.lastName}`,
                `${noRoleUser.firstName}` + ' ' + `${noRoleUser.lastName}`];
            await groupIdentityService.init(TestConfig.identity.adminUser, TestConfig.identity.adminPassword);
            groupAps = await groupIdentityService.createIdentityGroup();
            await groupIdentityService.assignRole(groupAps.id, CONSTANTS.ROLES.APS_ADMIN);
            groupActiviti = await groupIdentityService.createIdentityGroup();
            await groupIdentityService.assignRole(groupActiviti.id, CONSTANTS.ROLES.ACTIVITI_ADMIN);
            groupNoRole = await groupIdentityService.createIdentityGroup();
            selectedGroups = [`${groupAps.name}` , `${groupActiviti.name}`, `${groupNoRole.name}`];
            silentLogin = false;
            settingsPage.setProviderBpmSso(TestConfig.adf.hostBPM, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity, silentLogin);
            loginSSOPage.clickOnSSOButton();
            loginSSOPage.loginAPS(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
            navigationBarPage.navigateToPeopleGroupCloudPage();
            peopleGroupCloudComponentPage.checkGroupsCloudComponentTitleIsDisplayed();
            peopleGroupCloudComponentPage.checkPeopleCloudComponentTitleIsDisplayed();
        });

        afterAll(async () => {
            await identityService.deleteIdentityUser(apsUser.id);
            await identityService.deleteIdentityUser(activitiUser.id);
            await identityService.deleteIdentityUser(noRoleUser.id);
            await groupIdentityService.deleteIdentityGroup(groupAps.id);
            await groupIdentityService.deleteIdentityGroup(groupActiviti.id);
            await groupIdentityService.deleteIdentityGroup(groupNoRole.id);
        });

        beforeEach( () => {
            browser.refresh();
            peopleGroupCloudComponentPage.checkGroupsCloudComponentTitleIsDisplayed();
            peopleGroupCloudComponentPage.checkPeopleCloudComponentTitleIsDisplayed();
        });

        it('[C297674] Add roles filtering to PeopleCloudComponent', () => {
            peopleGroupCloudComponentPage.clickPeopleCloudMultipleSelection();
            peopleGroupCloudComponentPage.enterPeopleRoles('["APS_USER"]');
            peopleCloudComponent.searchAssignee('LastName');
            peopleCloudComponent.checkUserIsDisplayed(`${apsUser.firstName}` + ' ' + `${apsUser.lastName}`);
            peopleCloudComponent.checkUserIsNotDisplayed(`${activitiUser.firstName}` + ' ' + `${activitiUser.lastName}`);
            peopleCloudComponent.checkUserIsNotDisplayed(`${noRoleUser.firstName}` + ' ' + `${noRoleUser.lastName}`);
            peopleCloudComponent.selectAssigneeFromList(`${apsUser.firstName}` + ' ' + `${apsUser.lastName}`);
            peopleGroupCloudComponentPage.enterPeopleRoles('["APS_USER","ACTIVITI_USER"]');
            peopleCloudComponent.searchAssignee('LastName');
            peopleCloudComponent.checkUserIsDisplayed(`${activitiUser.firstName}` + ' ' + `${activitiUser.lastName}`);
            peopleCloudComponent.checkUserIsNotDisplayed(`${apsUser.firstName}` + ' ' + `${apsUser.lastName}`);
            peopleCloudComponent.checkUserIsNotDisplayed(`${noRoleUser.firstName}` + ' ' + `${noRoleUser.lastName}`);
            peopleCloudComponent.selectAssigneeFromList(`${activitiUser.firstName}` + ' ' + `${activitiUser.lastName}`);
            peopleGroupCloudComponentPage.clearField(peopleGroupCloudComponentPage.peopleRoleInput);
            peopleCloudComponent.searchAssignee('LastName');
            peopleCloudComponent.checkUserIsDisplayed(`${noRoleUser.firstName}` + ' ' + `${noRoleUser.lastName}`);
            peopleCloudComponent.checkUserIsNotDisplayed(`${apsUser.firstName}` + ' ' + `${apsUser.lastName}`);
            peopleCloudComponent.checkUserIsNotDisplayed(`${activitiUser.firstName}` + ' ' + `${activitiUser.lastName}`);
            peopleCloudComponent.selectAssigneeFromList(`${noRoleUser.firstName}` + ' ' + `${noRoleUser.lastName}`);
            peopleCloudComponent.checkSelectedPeople(selectedPeople);
        });

        it('[C297674] Add roles filtering to GroupCloudComponent', () => {
            peopleGroupCloudComponentPage.clickGroupCloudMultipleSelection();
            peopleGroupCloudComponentPage.enterGroupRoles('["APS_ADMIN"]');
            groupCloudComponent.searchGroups('TestGroup');
            groupCloudComponent.checkGroupIsDisplayed(`${groupAps.name}`);
            groupCloudComponent.checkGroupIsNotDisplayed(`${groupActiviti.name}`);
            groupCloudComponent.checkGroupIsNotDisplayed(`${groupNoRole.name}`);
            groupCloudComponent.selectGroupFromList(`${groupAps.name}`);
            peopleGroupCloudComponentPage.enterGroupRoles('["APS_ADMIN","ACTIVITI_ADMIN"]');
            groupCloudComponent.searchGroups('TestGroup');
            groupCloudComponent.checkGroupIsDisplayed(`${groupActiviti.name}`);
            groupCloudComponent.checkGroupIsNotDisplayed(`${groupAps.name}`);
            groupCloudComponent.checkGroupIsNotDisplayed(`${groupNoRole.name}`);
            groupCloudComponent.selectGroupFromList(`${groupActiviti.name}`);
            peopleGroupCloudComponentPage.clearField(peopleGroupCloudComponentPage.groupRoleInput);
            groupCloudComponent.searchGroups('TestGroup');
            groupCloudComponent.checkGroupIsDisplayed(`${groupNoRole.name}`);
            groupCloudComponent.checkGroupIsNotDisplayed(`${groupActiviti.name}`);
            groupCloudComponent.checkGroupIsNotDisplayed(`${groupAps.name}`);
            groupCloudComponent.selectGroupFromList(`${groupNoRole.name}`);
            groupCloudComponent.checkSelectedGroups(selectedGroups);
        });

    });

});