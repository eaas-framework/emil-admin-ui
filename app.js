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
	var stopUrl = "stop?sessionId={0}";
	var screenshotUrl = "screenshot?sessionId={0}";
	var saveNewEnvironment = "saveNewEnvironment";
	var saveEnvConfiguration = "saveEnvConfiguration";
	var getSoftwarePackageDescriptions = "getSoftwarePackageDescriptions";
	var overrideObjectCharacterizationUrl = "overrideObjectCharacterization";
	var characterizeObjectUrl = "characterizeObject?objectId={0}";
	var updateDescriptionUrl = "updateDescription";
	var deleteEnvironmentUrl = "deleteEnvironment";
	
	angular.module('emilAdminUI', ['angular-loading-bar', 'ngSanitize', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.select', 'angular-growl', 'smart-table', 'ng-sortable', 'pascalprecht.translate'])
		
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
			ACTIONS_ENV: 'Environment',
			ACTIONS_CHANGES: 'Changes',
			ACTIONS_SAVE: 'save',
				
			ADDENV_L: 'Add environment',
			ADDENV_SEARCH: 'Select an environment...',
			ADDENV_ADD: "Add",
			ADDENV_CANCEL: "Cancel",
			
			BASE_SHOW_MENU: 'Show menu',
			BASE_MENU_L: 'Menu',
			BASE_MENU_HELP: 'Help',
			
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
			ACTIONS_ENV: 'Umgebung',
			ACTIONS_CHANGES: 'Änderungen',
			ACTIONS_SAVE: 'speichern',
			
			ADDENV_L: 'Umgebung hinzufügen',
			ADDENV_SEARCH: 'Wählen oder suchen sie eine Umgebung...',
			DDENV_ADD: "Hinzufügen",
			ADDENV_CANCEL: "Abbrechen",
			
			BASE_SHOW_MENU: 'Menu anzeigen',
			BASE_MENU_L: 'Menu',
			BASE_MENU_HELP: 'Hilfe',
			
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
		});

		// escape HTML in the translation
		$translateProvider.useSanitizeValueStrategy('escape');

		$translateProvider.registerAvailableLanguageKeys(['en', 'de'], {
		'en_*': 'en',
		'de_*': 'de'
		})

		// automatically choose best language for user
		$translateProvider.determinePreferredLanguage();

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
			.state('wf-s', {
				abstract: true,
				url: "/wf-s",
				templateUrl: "partials/wf-s/base.html",
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
						controller: function ($http, $state, environmentList, localConfig, growl) {
							var vm = this;
							
							if (environmentList.data.status !== "0") {
								$state.go('error', {errorMsg: {title: "Load Environments Error " + environmentList.data.status, message: environmentList.data.message}});
								return;
							}
							
							vm.deleteEnvironment = function(envId) {
								if (window.confirm("Dies löscht die Umgebung unwiderruflich. Wollen sie wirklich fortfahren?")) {
									$http.post(localConfig.data.eaasBackendURL + deleteEnvironmentUrl, {
										envId: envId
									}).then(function(response) {
										if (response.data.status === "0") {
											// remove env locally
											vm.envs = vm.envs.filter(function(env) {
												return env.envId !== envId;
											});
											
											growl.success('Umgebung wurde erfolgreich gelöscht');
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
						controller: function ($http, $scope, $state, $stateParams, environmentList, localConfig, growl) {
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
										growl.success('Daten erfolgreich gespeichert');
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
					softwareId: null
				},
				resolve: {
					configureEnv: function($http, $stateParams, localConfig) {
						var result = null;
						
						if ($stateParams.isNewEnv) {
							result = $http.get(localConfig.data.eaasBackendURL + formatStr(startEnvWithSoftwarePackage, $stateParams.envId, $stateParams.softwareId))
						} else {
							result = $http.get(localConfig.data.eaasBackendURL + formatStr(configureEnv, $stateParams.envId));
						}
						
						return result;
					}
				},
				views: {
					'wizard': {
						templateUrl: "partials/wf-s/emulator.html",
						controller: function ($scope, $sce, configureEnv) {
							this.iframeurl = $sce.trustAsResourceUrl(configureEnv.data.iframeurl);
						},
						controllerAs: "startEmuCtrl"
					},
					'actions': {
						templateUrl: 'partials/wf-s/actions.html',
						controller: function ($scope, $state, $http, $uibModal, $stateParams, configureEnv, growl, localConfig) {							
							this.isNewEnv = $stateParams.isNewEnv;
						
							this.stopEmulator = function() {
								$http.get(localConfig.data.eaasBackendURL + formatStr(stopUrl, configureEnv.data.id)).then(function(response) {
									if (response.data.status === "0") {
										growl.success(response.data.message, {title: 'Ausführung erfolgreich beendet'});
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
										
										this.saveEnvironment = function() {
											var postResult = null;											
											
											if ($stateParams.isNewEnv) {
												postResult = $http.post(localConfig.data.eaasBackendURL + saveNewEnvironment, {
													sessionId: configureEnv.data.id,
													envId: $stateParams.envId,
													title: this.envName,
													description: this.envDescription,
													softwareId: $stateParams.softwareId													
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
													growl.success(response.data.message, {title: 'Daten erfolgreich gespeichert'});
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
						controller: function ($scope, $state, $stateParams, $uibModal, $http, localConfig, objEnvironments, environmentList, growl) {
							var vm = this;
							
							vm.objEnvironments = objEnvironments.data.environments;
							
							vm.automaticCharacterization = function() {
								if (window.confirm("Die automatische Charakterisierung ersetzt ihre aktuelle Zuordnung und dauert bis zu mehreren Minuten. Fortfahren?")) {
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
													growl.warning("Diese Umgebung ist bereits hinzugefügt..");
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
									growl.error("Es muss mindestens eine Umgebung zugeordnet werden.");
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