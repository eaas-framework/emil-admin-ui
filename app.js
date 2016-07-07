(function() {
	function formatStr(format) {
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
	
	var loadEnvsUrl = "loadEnvs?objectId={0}";
	var getAllEnvsUrl = "getEmilEnvironments";
	var configureEnv = "configureEnv?envId={0}";
	var startEnvWithSoftwarePackage = "startEnvWithSoftwarePackage?envId={0}&softwareId={1}";
	var startEnvWithDigitalObjectUrl = "startEnvWithDigitalObject?objectId={0}&envId={1}";
	var stopUrl = "stop?sessionId={0}";
	var screenshotUrl = "screenshot?sessionId={0}";
	var saveNewEnvironment = "saveNewEnvironment";
	var saveEnvConfiguration = "saveEnvConfiguration";
	var getSoftwarePackageDescriptions = "getSoftwarePackageDescriptions";
	var overrideObjectCharacterizationUrl = "overrideObjectCharacterization";
	var characterizeObjectUrl = "characterizeObject?objectId={0}";
	var updateDescriptionUrl = "updateDescription";
	var deleteEnvironmentUrl = "deleteEnvironment";
	var getObjectListURL = "getObjectList";
	
	angular.module('emilAdminUI', ['angular-loading-bar', 'ngSanitize', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.select', 'angular-growl', 'smart-table', 'ng-sortable', 'pascalprecht.translate'])

	.component('inputList', {
		templateUrl: 'partials/components/inputList.html',
		bindings: {
			list: '=',
			heading: '@',
			listEmptyNote: '@',
			inputPlaceholder: '@',
			addButtonText: '@',
		}
	})

	.config(function($stateProvider, $urlRouterProvider, growlProvider, $httpProvider, $translateProvider) {
		/*
		 * Internationalization 
		 */

		// German
		$translateProvider.translations('en', {
			CHOOSE_ENV_L: 'Environments',
			CHOOSE_ENV_ADD: 'New environment',
			CHOOSE_ENV_SEARCH: 'Search...',
			CHOOSE_ENV_PROPOSAL: '[Configure environment]',
			CHOOSE_ENV_EDIT: '[Edit description]',
			CHOOSE_ENV_DEL: '[Delete]',
			CHOOSE_ENV_VER: 'Version',
			
			ACTIONS_L: 'Actions',
			ACTIONS_RESTART: 'Restart',
			ACTIONS_SCREENSHOT: 'Screenshot',
			ACTIONS_STOP: 'Stop',
			ACTIONS_ENV: 'Save Environment',
			ACTIONS_CHANGES: 'Save Changes',
			ACTIONS_OBJ_ENV: 'Create Object Environment',
				
			ADDENV_L: 'Add environment',
			ADDENV_SEARCH: 'Select an environment...',
			ADDENV_ADD: "Add",
			ADDENV_CANCEL: "Cancel",
			
			BASE_SHOW_MENU: 'Show menu',
			BASE_MENU_L: 'Menu',
			BASE_MENU_HELP: 'Help',

			SW_INGEST_HEADER: 'Software Ingest',
			SW_INGEST_CHOOSE_OBJECT: 'Choose Object',
			SW_INGEST_CHOOSE_OBJECT_PH: 'Search or choose an object...',
			SW_INGEST_LICENSE_LBL: 'License information',
			SW_INGEST_LICENSE_PH: 'Enter license information...',
			SW_INGEST_NO_INSTANCES_LBL: 'Allowed number of instances (for unlimited choose -1):',
			SW_INGEST_FMT_NATIVE_HEADER: 'Rendering Capabilites: Native FMTs',
			SW_INGEST_FMT_NATIVE_EMPTY: 'No Native FMTs added yet.',
			SW_INGEST_FMT_NATIVE_PH: 'Native PUID...',
			SW_INGEST_FMT_NATIVE_BUTTON: 'Add native PUID',
			SW_INGEST_FMT_IMPORT_HEADER: 'Rendering Capabilites: Import FMTs',
			SW_INGEST_FMT_IMPORT_EMPTY: 'No Import FMTs added yet.',
			SW_INGEST_FMT_IMPORT_PH: 'Import PUID...',
			SW_INGEST_FMT_IMPORT_BUTTON: 'Add import PUID',
			SW_INGEST_FMT_EXPORT_HEADER: 'Rendering Capabilites: Export FMTs',
			SW_INGEST_FMT_EXPORT_EMPTY: 'No Export FMTs added yet.',
			SW_INGEST_FMT_EXPORT_PH: 'Export PUID...',
			SW_INGEST_FMT_EXPORT_BUTTON: 'Add export PUID',
			SW_INGEST_SAVE_BUTTON: 'Save',
			
			EDITENV_L: 'Edit Environment',
			EDITENV_NAME: 'Name',
			EDITENV_NAME_PH: 'Environment name',
			EDITENV_DESC: 'Description',
			EDITENV_DESC_PH: 'Environment description',
			EDITENV_EMULATOR: 'Emulator',
			EDITENV_OS: 'OS',
			EDITENV_SW: 'Software',
			EDITENV_SAVE: 'Save',
			EDITENV_CANCEL: 'Cancel',
				
			CHAR_L: 'Characterize object', 
			CHAR_AUT: 'Automated characterization',
			CHAR_ADD: 'Add environment',
			CHAR_SAVE: 'Save',
			CHAR_CANCEL: 'Cancel',
				
			EMU_TITLE: 'Preparing emulation session',

			NEWENV_L: 'Create environment',
			NEWENV_BASE: 'Base environment',
			NEWENV_SW: 'Software',
			NEWENV_SELECT_ENV: 'Select environment...',
			NEWENV_SELECT_SW: 'Select software...',
			NEWENV_START: 'Start',
			NEWENV_CANCEL: 'Cancel',
			
			SAVEENV_L: 'Save changes',
			SAVEENV_NAME: 'Name',
			SAVEENV_NAME_PH: 'Envirnment name',
			SAVEENV_DESC: 'Decription',
			SAVEENV_DESC_PH: 'Description of changes..',
			SAVEENV_SAVE: 'Save',
			SAVEENV_CANCEL: 'Cancel',
			
			JS_DELENV_OK: 'Do you really want to delete this environment',
			JS_DELENV_SUCCESS: 'Environment has been deleted',
			JS_ENV_UPDATE: 'Metadata has been updated',
			JS_ACTIONS_SUCCESS: 'Success',
			JS_START_CHAR: 'Automated characterization may take some time. Continue?',
			JS_ENV_ERR_DUP: 'Environment already selected',
			JS_ENV_ERR_ZERO: 'At least one environment has to be selected'
		});

		// English
		$translateProvider.translations('de', {
			CHOOSE_ENV_L: 'Standardumgebungen',
			CHOOSE_ENV_ADD: 'Neue Umgebung anlegen',
			CHOOSE_ENV_SEARCH: 'Eintippen zum Suchen...',
			CHOOSE_ENV_PROPOSAL: '[Umgebung konfigurieren]',
			CHOOSE_ENV_EDIT: '[Beschreibung bearbeiten]',
			CHOOSE_ENV_DEL: '[Löschen]',
			CHOOSE_ENV_VER: 'Version',
			
			ACTIONS_L: 'Aktionen',
			ACTIONS_RESTART: 'Neustarten',
			ACTIONS_SCREENSHOT: 'Screenshot',
			ACTIONS_STOP: 'Beenden',
			ACTIONS_ENV: 'Umgebung speichern',
			ACTIONS_CHANGES: 'Änderungen speichern',
			ACTIONS_OBJ_ENV: 'Neue Objekt Umgebung',
			
			ADDENV_L: 'Umgebung hinzufügen',
			ADDENV_SEARCH: 'Wählen oder suchen sie eine Umgebung...',
			ADDENV_ADD: "Hinzufügen",
			ADDENV_CANCEL: "Abbrechen",
			
			BASE_SHOW_MENU: 'Menu anzeigen',
			BASE_MENU_L: 'Menu',
			BASE_MENU_HELP: 'Hilfe',

			SW_OVERVIEW_HEADER: 'Software',
			SW_OVERVIEW_ADD: 'Neue Software anlegen',
			SW_OVERVIEW_SEARCH: 'Eintippen zum Suchen...',
			SW_OVERVIEW_SW_EDIT: '[Bearbeiten]',
			SW_OVERVIEW_SW_DEL: '[Löschen]',

			SW_INGEST_HEADER: 'Software Ingest',
			SW_INGEST_CHOOSE_OBJECT: 'Objekt auswählen',
			SW_INGEST_CHOOSE_OBJECT_PH: 'Wählen oder suchen sie ein Objekt...',
			SW_INGEST_LICENSE_LBL: 'Lizenzinformationen',
			SW_INGEST_LICENSE_PH: 'Lizenzinformationen eingeben...',
			SW_INGEST_NO_INSTANCES_LBL: 'Erlaubte Instanzanzahl (-1 für unbegrenzt)',
			SW_INGEST_FMT_NATIVE_HEADER: 'Rendering Capabilites: Native FMTs',
			SW_INGEST_FMT_NATIVE_EMPTY: 'No Native FMTs added yet.',
			SW_INGEST_FMT_NATIVE_PH: 'Native PUID...',
			SW_INGEST_FMT_NATIVE_BUTTON: 'Add native PUID',
			SW_INGEST_FMT_IMPORT_HEADER: 'Rendering Capabilites: Import FMTs',
			SW_INGEST_FMT_IMPORT_EMPTY: 'No Import FMTs added yet.',
			SW_INGEST_FMT_IMPORT_PH: 'Import PUID...',
			SW_INGEST_FMT_IMPORT_BUTTON: 'Add import PUID',
			SW_INGEST_FMT_EXPORT_HEADER: 'Rendering Capabilites: Export FMTs',
			SW_INGEST_FMT_EXPORT_EMPTY: 'No Export FMTs added yet.',
			SW_INGEST_FMT_EXPORT_PH: 'Export PUID...',
			SW_INGEST_FMT_EXPORT_BUTTON: 'Add export PUID',
			SW_INGEST_CANCEL_BUTTON: 'Abbrechen',
			SW_INGEST_SAVE_BUTTON: 'Speichern',

			EDITENV_L: 'Umgebung bearbeiten',
			EDITENV_NAME: 'Name',
			EDITENV_NAME_PH: 'Name der Umgebung..',
			EDITENV_DESC: 'Beschreibung',
			EDITENV_DESC_PH: 'Beschreibung der Umgebung..',
			EDITENV_EMULATOR: 'Emulator',
			EDITENV_OS: 'OS',
			EDITENV_SW: 'Software',
			EDITENV_SAVE: 'Speichern',
			EDITENV_CANCEL: 'Abbrechen',
			
			CHAR_L: 'Objektcharakterisierung',
			CHAR_AUT: 'Automatische Charakterisierung',
			CHAR_ADD: 'Umgebung hinzufügen',
			CHAR_SAVE: 'Speichern',
			CHAR_CANCEL: 'Abbrechen',
			
			EMU_TITLE: 'Das Emulationsystem wird gestartet...',
			
			NEWENV_L: 'Standardumgebung erstellen',
			NEWENV_BASE: 'Basisumgebung',
			NEWENV_SW: 'Software',
			NEWENV_SELECT_ENV: 'Wählen oder suchen sie eine Umgebung...',
			NEWENV_SELECT_SW: 'Wählen oder suchen sie eine Software...',
			NEWENV_START: 'Starten',
			NEWENV_CANCEL: 'Abbrechen',
			
			SAVEENV_L: 'Änderungen speichern',
			SAVEENV_NAME: 'Name',
			SAVEENV_NAME_PH: 'Name der Umgebung..',
			SAVEENV_DESC: 'Beschreibung',
			SAVEENV_DESC_PH: 'Beschreibung der Änderungen..',
			SAVEENV_SAVE: 'Speichern',
			SAVEENV_CANCEL: 'Abbrechen',
			
			JS_DELENV_OK: 'Dies löscht die Umgebung unwiderruflich. Wollen sie wirklich fortfahren?',
			JS_DELENV_SUCCESS: 'Umgebung wurde erfolgreich gelöscht',
			JS_ENV_UPDATE: 'Daten erfolgreich gespeichert',
			JS_ACTIONS_SUCCESS: 'Ausführung erfolgreich beendet',
			JS_START_CHAR: 'Die automatische Charakterisierung ersetzt ihre aktuelle Zuordnung und dauert bis zu mehreren Minuten. Fortfahren?',
			JS_ENV_ERR_DUP: 'Diese Umgebung ist bereits hinzugefügt..',
			JS_ENV_ERR_ZERO: 'Es muss mindestens eine Umgebung zugeordnet werden.'
		});

		// escape HTML in the translation
		$translateProvider.useSanitizeValueStrategy('escape');

		$translateProvider.registerAvailableLanguageKeys(['en', 'de'], {
		'en_*': 'en',
		'de_*': 'de'
		})

		// automatically choose best language for user
		$translateProvider.determinePreferredLanguage();
		// $translateProvider.preferredLanguage('en');
		
		// Add a global AJAX error handler
		$httpProvider.interceptors.push(function($q, $injector) {
			return {
				responseError: function(rejection) {
					$injector.get('$state').go('error', {errorMsg: {title: "Server Error", message: rejection}});
					return $q.reject(rejection);
				}
			};
		});

		// For any unmatched url
		$urlRouterProvider.otherwise("/wf-s/standard-envs-overview");

		// Now set up the states
		$stateProvider
			.state('error', {
				url: "/error",
				templateUrl: "partials/error.html",
				params: {
					errorMsg: {title: "", message: ""}
				},
				controller: function($stateParams) {
					this.errorMsg = $stateParams.errorMsg;
				},
				controllerAs: "errorCtrl"
			})
			.state('wf-i', {
				abstract: true,
				url: "/wf-i",
				templateUrl: "partials/base.html",
				resolve: {
					localConfig: function($http) {
						return $http.get("config.json");
					}
				},
				controller: function($uibModal) {
					this.open = function() {
						$uibModal.open({
							animation: true,
							templateUrl: 'partials/wf-s/help-emil-dialog.html'
						});
					}
				},
				controllerAs: "baseCtrl"
			})
			.state('wf-i.sw-overview', {
				url: "/sw-overview",
				resolve: {
					softwareList: function($http, localConfig) {
						return $http.get(localConfig.data.eaasBackendURL + getSoftwarePackageDescriptions);
					}
				},
				views: {
					'wizard': {
						templateUrl: 'partials/wf-i/sw-overview.html',
						controller: function (softwareList) {
							var vm = this;

							if (softwareList.data.status !== "0") {
								$state.go('error', {errorMsg: {title: "Load Environments Error " + softwareList.data.status, message: softwareList.data.message}});
								return;
							}

							vm.softwareList = softwareList.data.descriptions;
						},
						controllerAs: "swOverviewCtrl"
					}
				}
			})
			.state('wf-i.sw-ingest', {
				url: "/sw-ingest",
				params: {
					swId: "-1"
				},
				resolve: {
					objectList: function($stateParams, $http, localConfig) {
						// Don't fetch list for edit
						if ($stateParams.swId != "-1") {
							return null;
						}

						return $http.get(localConfig.data.eaasBackendURL + getObjectListURL);
					},
					softwareObj: function($stateParams, $http, localConfig) {
						// return empty object for new software
						// if ($stateParams.swId === "-1") {
							return {
								objectId: null,
								licenseInformation: "",
								allowedInstances: 1,
								nativeFMTs: [],
								importFMTs: [],
								exportFMTs: [],
							}
						// }

						// TODO if $stateParams.swId != "-1" get from REST for edit
						// return $http.get(localConfig.data.eaasBackendURL + getSoftwareObjectURL);
					},
				},
				views: {
					'wizard': {
						templateUrl: 'partials/wf-i/sw-ingest.html',
						controller: function ($stateParams, $state, objectList, softwareObj) {
							var vm = this;

							vm.isNewSoftware = $stateParams.swId === "-1";

							if (vm.isNewSoftware) {
								vm.selectedObject = null;
								vm.objectList = objectList.data.objects;
							} else {
								vm.selectedObject = {id: $stateParams.swId, title: $stateParams.swId};
								vm.objectList = [vm.selectedObject];
							}

							vm.softwareObj = softwareObj;

							vm.save = function() {
								vm.softwareObj.objectId = vm.selectedObject.id;

								// TODO save to REST
								console.log(JSON.stringify(vm.softwareObj));

								$state.go('wf-i.sw-overview', {}, {reload: true});
							};
						},
						controllerAs: "swIngestCtrl"
					}
				}
			})
			.state('wf-s', {
				abstract: true,
				url: "/wf-s",
				templateUrl: "partials/base.html",
				resolve: {
					localConfig: function($http) {
						return $http.get("config.json");
					},
					environmentList: function($http, localConfig) {
						return $http.get(localConfig.data.eaasBackendURL + getAllEnvsUrl);
					}
				},
				controller: function($uibModal) {
					this.open = function() {
						$uibModal.open({
							animation: true,
							templateUrl: 'partials/wf-s/help-emil-dialog.html'
						});
					}
				},
				controllerAs: "baseCtrl"
			})
			.state('wf-s.standard-envs-overview', {
				url: "/standard-envs-overview",
				views: {
					'wizard': {
						templateUrl: 'partials/wf-s/standard-envs-overview.html',
						controller: function ($http, $state, environmentList, localConfig, growl, $translate) {
							var vm = this;
							
							if (environmentList.data.status !== "0") {
								$state.go('error', {errorMsg: {title: "Load Environments Error " + environmentList.data.status, message: environmentList.data.message}});
								return;
							}
							
							vm.deleteEnvironment = function(envId) {
								if (window.confirm($translate.instant('JS_DELENV_OK'))) {
									$http.post(localConfig.data.eaasBackendURL + deleteEnvironmentUrl, {
										envId: envId
									}).then(function(response) {
										if (response.data.status === "0") {
											// remove env locally
											vm.envs = vm.envs.filter(function(env) {
												return env.envId !== envId;
											});
											
											growl.success($translate.instant('JS_DELENV_SUCCESS'));
										} else {
											growl.error(response.data.message, {title: 'Error ' + response.data.status});
										}
									});
								}
							};
						
							vm.envs = environmentList.data.environments;
						},
						controllerAs: "standardEnvsOverviewCtrl"
					}
				}
			})
			.state('wf-s.new-env', {
				url: "/new-env",
				resolve: {
					softwareList: function($http, localConfig) {
						return $http.get(localConfig.data.eaasBackendURL + getSoftwarePackageDescriptions);
					}
				},
				views: {
					'wizard': {
						templateUrl: 'partials/wf-s/new-env.html',
						controller: function ($scope, $state, $stateParams, environmentList, softwareList, growl) {
							this.envs = environmentList.data.environments;							
							this.software = softwareList.data.descriptions;
						},
						controllerAs: "newEnvCtrl"
					}
				}
			})
			.state('wf-s.edit-env', {
				url: "/edit-env",
				params: {
					envId: "-1"
				},
				views: {
					'wizard': {
						templateUrl: 'partials/wf-s/edit-env.html',
						controller: function ($http, $scope, $state, $stateParams, environmentList, localConfig, growl, $translate) {
							var envIndex = -1;
							for(var i = 0; i < environmentList.data.environments.length; i++) {
								if (environmentList.data.environments[i].envId === $stateParams.envId) {
									envIndex = i;
									break;
								}
							}
							
							// for readonly
							this.env = environmentList.data.environments[envIndex];
							
							this.envName = environmentList.data.environments[envIndex].title;
							this.envDescription = environmentList.data.environments[envIndex].description;
							
							this.saveEdit = function() {
								environmentList.data.environments[envIndex].title = this.envName;
								environmentList.data.environments[envIndex].description = this.envDescription;
							
								$http.post(localConfig.data.eaasBackendURL + updateDescriptionUrl, {
									envId: $stateParams.envId,
									title: this.envName,
									description: this.envDescription
								}).then(function(response) {
									if (response.data.status === "0") {
										growl.success($translate.instant('JS_ENV_UPDATE'));
									} else {
										growl.error(response.data.message, {title: 'Error ' + response.data.status});
									}
									
									$state.go('wf-s.standard-envs-overview', {}, {reload: true});
								});
							};
						},
						controllerAs: "editEnvCtrl"
					}
				}
			})
			.state('wf-s.emulator', {
				url: "/emulator",
				params: {
					envId: "-1",
					isNewEnv: false,
					softwareId: null,
					isNewObjectEnv: false,
					objectId: null
				},
				resolve: {
					configureEnv: function($http, $stateParams, localConfig) {
						var result = null;
						
						if ($stateParams.isNewEnv) {
							result = $http.get(localConfig.data.eaasBackendURL + formatStr(startEnvWithSoftwarePackage, $stateParams.envId, $stateParams.softwareId))
						} else if ($stateParams.isNewObjectEnv) {
							result = $http.get(localConfig.data.eaasBackendURL + formatStr(startEnvWithDigitalObjectUrl, $stateParams.objectId, $stateParams.envId))
						}
						else {
							result = $http.get(localConfig.data.eaasBackendURL + formatStr(configureEnv, $stateParams.envId));
						}
						
						return result;
					}
				},
				views: {
					'wizard': {
						templateUrl: "partials/wf-s/emulator.html",
						controller: function ($scope, $sce, $state, configureEnv, growl) {
							if (configureEnv.data.status === "1") {
								$state.go('error', {errorMsg: {title: "Emulation Error " + configureEnv.data.status, message: configureEnv.data.message}});
								return;
							}
							this.iframeurl = $sce.trustAsResourceUrl(configureEnv.data.iframeurl);
						},
						controllerAs: "startEmuCtrl"
					},
					'actions': {
						templateUrl: 'partials/wf-s/actions.html',
						controller: function ($scope, $state, $http, $uibModal, $stateParams, configureEnv, growl, localConfig, $translate) {							
							this.isNewEnv = $stateParams.isNewEnv;
							this.isNewObjectEnv = $stateParams.isNewObjectEnv;	
							this.stopEmulator = function() {
								$http.get(localConfig.data.eaasBackendURL + formatStr(stopUrl, configureEnv.data.id)).then(function(response) {
									if (response.data.status === "0") {
										growl.success(response.data.message, {title: $translate.instant('JS_ACTIONS_SUCCESS')});
									} else {
										growl.error(response.data.message, {title: 'Error ' + response.data.status});
									}
									
									$state.go('wf-s.standard-envs-overview');
								});
							};
							
							this.restartEmulator = function() {
								$http.get(localConfig.data.eaasBackendURL + formatStr(stopUrl, configureEnv.data.id))['finally'](function() {
									$state.reload();
								});
							};
						
							this.screenshot = function() {
								 window.open(localConfig.data.eaasBackendURL + formatStr(screenshotUrl, configureEnv.data.id), '_blank', ''); 
							};
							
							this.openSaveEnvironmentDialog = function() {
								$uibModal.open({
									animation: true,
									templateUrl: 'partials/wf-s/save-environment-dialog.html',
									controller: function($scope) {
										this.isNewEnv = $stateParams.isNewEnv;
										this.isNewObjectEnv = $stateParams.isNewObjectEnv;	
										this.saveEnvironment = function() {
											var postResult = null;											
											
											if ($stateParams.isNewEnv) {
												postResult = $http.post(localConfig.data.eaasBackendURL + saveNewEnvironment, {
													sessionId: configureEnv.data.id,
													envId: $stateParams.envId,
													title: this.envName,
													description: this.envDescription,
													softwareId: $stateParams.softwareId,	
													isObjectEnvironment: false													
												});
											} else if ($stateParams.isNewObjectEnv) {
												postResult = $http.post(localConfig.data.eaasBackendURL + saveNewEnvironment, {
													sessionId: configureEnv.data.id,
													envId: $stateParams.envId,
													title: this.envName,
													description: this.envDescription,
													softwareId: $stateParams.softwareId,
													isObjectEnvironment: true													
												});
											} else {
												postResult = $http.post(localConfig.data.eaasBackendURL + saveEnvConfiguration, {
													sessionId: configureEnv.data.id,
													envId: $stateParams.envId,
													message: this.envDescription
												});
											}
											
											postResult.then(function(response) {
												if (response.data.status === "0") {
													growl.success(response.data.message, {title: $translate.instant('JS_ACTIONS_SUCCESS')});
												} else {
													growl.error(response.data.message, {title: 'Error ' + response.data.status});
												}
												
												$scope.$close();
												$state.go('wf-s.standard-envs-overview', {}, {reload: true});
											});
										};
									},
									controllerAs: "openSaveEnvironmentDialogCtrl"
								});
							}
							
							this.sessionId = configureEnv.data.id;
						},
						controllerAs: "actionsCtrl"
					}
				}
			})
			.state('wf-s.edit-object-characterization', {
				url: "/edit-object-characterization?objectId",
				resolve: {
					objEnvironments: function($stateParams, $http, localConfig) {
						return $http.get(localConfig.data.eaasBackendURL + formatStr(loadEnvsUrl, $stateParams.objectId));
					}
				},
				views: {
					'wizard': {
						templateUrl: 'partials/wf-s/edit-object-characterization.html',
						controller: function ($scope, $state, $stateParams, $uibModal, $http, localConfig, objEnvironments, environmentList, growl, $translate) {
							var vm = this;
							
							vm.objEnvironments = objEnvironments.data.environments;
							vm.objectId = $stateParams.objectId;
							
							vm.automaticCharacterization = function() {
								if (window.confirm($translate.instant('JS_START_CHAR'))) {
									$("html, body").addClass("wait");
									$(".fullscreen-overlay-spinner").show();
									$http.get(localConfig.data.eaasBackendURL + formatStr(characterizeObjectUrl, $stateParams.objectId)).then(function(response) {
										if (response.data.status !== "0") {
											growl.error(response.data.message, {title: 'Error ' + response.data.status});
											return;
										}
										
										vm.objEnvironments.length = 0;
										vm.objEnvironments.push.apply(vm.objEnvironments, response.data.environments);
									})['finally'](function() {
										$("html, body").removeClass("wait");
										$(".fullscreen-overlay-spinner").hide();
									});
								}
							};
							
							vm.openAddEnvDialog = function() {
								$uibModal.open({
									animation: true,
									templateUrl: 'partials/wf-s/add-environment-dialog.html',
									controller: function($scope) {
										this.newEnv = null;
										this.environments = environmentList.data.environments;
										
										this.addEnvironment = function() {
											// check if environment was already added
											for (var i = 0; i < objEnvironments.data.environments.length; i++) {
												if (objEnvironments.data.environments[i].id === this.newEnv.envId) {
													growl.warning($translate.instant('JS_ENV_ERR_DUP'));
													return;
												}
											}
											
											objEnvironments.data.environments.push({
												"id": this.newEnv.envId,
												"label": this.newEnv.title											
											});											
											$scope.$close();
										};
									},
									controllerAs: "addEnvDialogCtrl"
								});
							};
							
							vm.removeEnvironment = function(env) {
								if (objEnvironments.data.environments.length === 1) {
									growl.error($translate.instant('JS_ENV_ERR_ZERO'));
									return;
								}
								
								var i;
								for (i = 0; i < objEnvironments.data.environments.length; i++) {
									if (objEnvironments.data.environments[i].id === env.id) {
										break;
									}
								}
								
								objEnvironments.data.environments.splice(i, 1);
							};
							
							vm.saveCharacterization = function() {
								$http.post(localConfig.data.eaasBackendURL + overrideObjectCharacterizationUrl, {
									objectId: $stateParams.objectId,
									environments: objEnvironments.data.environments
								}).then(function() {
									$state.go('wf-s.standard-envs-overview');
								});
							};
						},
						controllerAs: "editObjectCharacterizationCtrl"
					}
				}
			});
			
		growlProvider.globalTimeToLive(5000);
	});
})();
