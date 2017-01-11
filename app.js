(function() {
	function formatStr(format) {
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
	
	var loadEnvsUrl = "loadEnvs?objectId={0}";
	var getAllEnvsUrl = "getEmilEnvironments";
	var getObjectEnvironmentsUrl ="getEmilObjectEnvironments"
	var configureEnv = "configureEnv?envId={0}&language={1}&layout={2}";
	var startEnvWithSoftwarePackage = "startEnvWithSoftwarePackage?envId={0}&softwareId={1}&language={2}&layout={3}";
	var startEnvWithDigitalObjectUrl = "startEnvWithDigitalObject?objectId={0}&envId={1}&language={2}&layout={3}";
	var stopUrl = "stop?sessionId={0}";
	var screenshotUrl = "screenshot?sessionId={0}";
	var saveNewEnvironment = "saveNewEnvironment";
	var saveNewObjectEnvironmentUrl = "saveObjectConfiguration";
	var saveEnvConfiguration = "saveEnvConfiguration";
	var getSoftwarePackageDescriptions = "getSoftwarePackageDescriptions";
	var overrideObjectCharacterizationUrl = "overrideObjectCharacterization";
	var characterizeObjectUrl = "characterizeObject?objectId={0}";
	var updateDescriptionUrl = "updateDescription";
	var deleteEnvironmentUrl = "deleteEnvironment";
	var getObjectListURL = "getObjectList";
	var saveSoftwareUrl = "saveSoftwareObject";
	var exportEnvironmentUrl = "export?envId={0}";
	var getSoftwareObjectURL = "getSoftwareObject?softwareId={0}";
	var initEmilEnvironmentsURL = "initEmilEnvironments";
	var getEnvironmentTemplates = "getEnvironmentTemplates";
	var createImageUrl = "createImage?size={0}";
	var prepareEnvironmentUrl = "prepareEnvironment";
	var importImageUrl = "importImage";
	
	angular.module('emilAdminUI', ['angular-loading-bar', 'ngSanitize', 'ngAnimate', 'ngCookies', 'ui.router', 'ui.bootstrap', 
								   'ui.mask', 'ui.select', 'angular-growl', 'smart-table', 'ng-sortable', 'pascalprecht.translate', 
	                               'angular-page-visibility', 'textAngular'])

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

	.controller('settingsDialogController', function($state, $http, $scope, $uibModal, localConfig, kbLayouts, growl) {		
		var vm = this;

		vm.importEnvs = function() {
			$scope.$close();

			$http.get(localConfig.data.eaasBackendURL + initEmilEnvironmentsURL).then(function(response) {
				if (response.data.status === "0") {
					$state.go('wf-s.standard-envs-overview', {}, {reload: true});
						growl.success(response.data.message);
					} else {
						growl.error(response.data.message, {title: 'Error ' + response.data.status});
					}
				}
			);
		};

		vm.showSetKeyboardLayoutDialog = function() {
			$uibModal.open({
				animation: true,
				templateUrl: 'partials/set-keyboard-layout-dialog.html',
				resolve: {
					kbLayouts: function() {
						return kbLayouts; // refers to outer kbLayouts variable
					}
				},
				controller: "setKeyboardLayoutDialogController as setKeyboardLayoutDialogCtrl"
			});
		};
	})

	.controller('setKeyboardLayoutDialogController', function($scope, $cookies, $translate, kbLayouts, growl) {
		this.kbLayouts = kbLayouts.data;

		var kbLayoutPrefs = $cookies.getObject('kbLayoutPrefs');

		if (kbLayoutPrefs) {
			this.chosen_language = kbLayoutPrefs.language;
			this.chosen_layout = kbLayoutPrefs.layout;
		}

		this.saveKeyboardLayout = function() {
			if (!this.chosen_language || !this.chosen_layout) {
				growl.error($translate.instant('SET_KEYBOARD_DLG_SAVE_ERROR_EMPTY'));
				return;
			}

			$cookies.putObject('kbLayoutPrefs', {"language": this.chosen_language, "layout": this.chosen_layout}, {expires: new Date('2100')});

			growl.success($translate.instant('SET_KEYBOARD_DLG_SAVE_SUCCESS'));
			$scope.$close();
		};
	})

	.config(function($stateProvider, $urlRouterProvider, growlProvider, $httpProvider, $translateProvider) {
		/*
		 * Internationalization 
		 */
		$translateProvider.useStaticFilesLoader({
		  prefix: 'locales/',
		  suffix: '.json'
		});

		// escape HTML in the translation
		$translateProvider.useSanitizeValueStrategy('escape');

		$translateProvider.registerAvailableLanguageKeys(['en', 'de'], {
		  'en_*': 'en',
		  'de_*': 'de'
		});

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
				controller: function($state, $stateParams) {
					if ($stateParams.errorMsg.title === "" && $stateParams.errorMsg.title === "") {
						$state.go('wf-s.standard-envs-overview');
						return;
					}

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
						return $http.get("config.json" + '?id=' + new Date().getTime());
					},
					kbLayouts: function($http) {
						return $http.get("kbLayouts.json");
					}
				},
				controller: function($uibModal, localConfig, kbLayouts) {
					var vm = this;

					vm.open = function() {
						$uibModal.open({
							animation: true,
							templateUrl: 'partials/wf-s/help-emil-dialog.html'
						});
					};

					vm.showSettingsDialog = function() {
						$uibModal.open({
							animation: true,
							templateUrl: 'partials/settings-dialog.html',
							resolve: {
								localConfig: function() {
									return localConfig;
								},
								kbLayouts: function() {
									return kbLayouts;
								}
							},
							controller: "settingsDialogController as settingsDialogCtrl"
						});
					};
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
						if ($stateParams.swId === "-1") {
							return {
								data: {
									objectId: null,
									licenseInformation: "",
									allowedInstances: -1,
									nativeFMTs: [],
									importFMTs: [],
									exportFMTs: [],
								}
							};
						}

					    return $http.get(localConfig.data.eaasBackendURL + formatStr(getSoftwareObjectURL, $stateParams.swId));
					},
				},
				views: {
					'wizard': {
						templateUrl: 'partials/wf-i/sw-ingest.html',
						controller: function ($stateParams, $state, $http, localConfig, growl, objectList, softwareObj) {
							var vm = this;

							vm.isNewSoftware = $stateParams.swId === "-1";

							if (vm.isNewSoftware) {
								vm.selectedObject = null;
								vm.objectList = objectList.data.objects;
							} else {
								vm.selectedObject = {id: $stateParams.swId, title: $stateParams.swId};
								vm.objectList = [vm.selectedObject];
							}

							vm.softwareObj = softwareObj.data;

							vm.save = function() {
								vm.softwareObj.objectId = vm.selectedObject.id;
								console.log(JSON.stringify(vm.softwareObj));
								
								$http.post(localConfig.data.eaasBackendURL + saveSoftwareUrl, vm.softwareObj).then(function(response) {
									if (response.data.status === "0") {
										growl.success(response.data.message);
										$state.go('wf-i.sw-overview', {}, {reload: true});
										
									} else {
										growl.error(response.data.message, {title: 'Error ' + response.data.status});
									}
								});
								
							};
						},
						controllerAs: "swIngestCtrl"
					}
				}
			})
			.state('wf-i.new-image', {
				url: "/new-image",
				resolve: {
					systemList: function($http, localConfig) {
						return $http.get(localConfig.data.eaasBackendURL + getEnvironmentTemplates);
					},
					softwareList: function($http, localConfig) {
						return $http.get(localConfig.data.eaasBackendURL + getSoftwarePackageDescriptions);
					}
				},
				views: {
					'wizard': {
						templateUrl: 'partials/wf-i/new-image.html',
						controller: function ($http, $scope, $state, $stateParams, systemList, softwareList, growl, localConfig) {
							var vm = this;

							vm.systems = systemList.data.systems;
							vm.softwareList = softwareList.data.descriptions;

							// initialize default values of the form
							vm.hdsize = 1024;
							vm.hdtype = 'size';

							vm.imageId = "";
							
							vm.onSelectSystem = function(item, model) {
								vm.native_config = item.native_config;
							};

							vm.start = function() {
								console.log(vm.selectedSystem);
								console.log(vm.name);

								// please refactor!
								if (vm.hdtype == 'new') {
									// console.log(vm.hdsize);
									// console.log(vm.selectedSoftware);
									$http.get(localConfig.data.eaasBackendURL + formatStr(createImageUrl, vm.hdsize + 'M')).then(function(response) {
										if (response.data.status !== "0") 
											growl.error(response.data.message, {title: 'Error ' + response.data.status});
										
										vm.imageId = response.data.id;
										var postObj = {
												label: vm.name,
												templateId: vm.selectedSystem.id,								
												imageId: vm.imageId,
												nativeConfig: vm.native_config
												};
										$http.post(localConfig.data.eaasBackendURL + prepareEnvironmentUrl, postObj).then(function(response) {
												if (response.data.status !== "0") 
													growl.error(response.data.message, {title: 'Error ' + response.data.status});
												$state.go('wf-s.emulator', {envId: vm.imageId, isNewEnv: false, softwareId: vm.selectedSoftware.id});
											});
									});
								} else {
									console.log(vm.hdurl);
									$http.post(localConfig.data.eaasBackendURL + importImageUrl, {url: vm.hdurl}).then(function(response) {
										if (response.data.status !== "0") 
											growl.error(response.data.message, {title: 'Error ' + response.data.status});
										
										vm.imageId = response.data.id;
										var postObj = {
												label: vm.name,
												templateId: vm.selectedSystem.id,								
												imageId: vm.imageId,
												nativeConfig: vm.native_config
												};
										$http.post(localConfig.data.eaasBackendURL + prepareEnvironmentUrl, postObj).then(function(response) {
												if (response.data.status !== "0") 
													growl.error(response.data.message, {title: 'Error ' + response.data.status});
												$state.go('wf-s.emulator', {envId: vm.imageId, isNewEnv: false});
											});
									});
									
								}
								
							};
						},
						controllerAs: "newImageCtrl"
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
					},
					objectEnvironmentList: function($http, localConfig) {
						return $http.get(localConfig.data.eaasBackendURL + getObjectEnvironmentsUrl)
					},
					kbLayouts: function($http) {
						return $http.get("kbLayouts.json");
					}
				},
				controller: function($state, $uibModal, $http, localConfig, kbLayouts, growl) {
					var vm = this;
					
					vm.open = function() {
						$uibModal.open({
							animation: true,
							templateUrl: 'partials/wf-s/help-emil-dialog.html'
						});
					}
					
					vm.showSettingsDialog = function() {
						$uibModal.open({
							animation: true,
							templateUrl: 'partials/settings-dialog.html',
							resolve: {
								localConfig: function() {
									return localConfig;
								},
								kbLayouts: function() {
									return kbLayouts;
								}
							},
							controller: "settingsDialogController as settingsDialogCtrl"
						});
					};
				},
				controllerAs: "baseCtrl"
			})
			.state('wf-s.standard-envs-overview', {
				url: "/standard-envs-overview",
				params: {
					showObjects: false
				},
				views: {
					'wizard': {
						templateUrl: 'partials/wf-s/standard-envs-overview.html',
						controller: function ($http, $state, $stateParams, environmentList, objectEnvironmentList, localConfig, growl, $translate) {
							var vm = this;
							
							if (environmentList.data.status !== "0") {
								$state.go('error', {errorMsg: {title: "Load Environments Error " + environmentList.data.status, message: environmentList.data.message}});
								return;
							}
							
							vm.exportEnvironment = function(envId) {
									
								$http.get(localConfig.data.eaasBackendURL + formatStr(exportEnvironmentUrl, envId))		
									.then(function(response) {
										if (response.data.status === "0") {
											growl.success("export successful");
										} else {
											growl.error(response.data.message, {title: 'Error ' + response.data.status});
										}
									});
								
							};
							
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
							vm.objEnvs = objectEnvironmentList.data.environments;
							vm.showObjects = $stateParams.showObjects;
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
							this.helpText = environmentList.data.environments[envIndex].helpText;
							
							this.saveEdit = function() {
								environmentList.data.environments[envIndex].title = this.envName;
								environmentList.data.environments[envIndex].description = this.envDescription;
								environmentList.data.environments[envIndex].helpText = this.helpText;
							
								$http.post(localConfig.data.eaasBackendURL + updateDescriptionUrl, {
									envId: $stateParams.envId,
									title: this.envName,
									description: this.envDescription,
									helpText: this.helpText
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
					configureEnv: function($http, $stateParams, $cookies, localConfig) {
						var result = null;

						// fallback to defaults when no cookie is found
						var kbLayoutPrefs = $cookies.getObject('kbLayoutPrefs') || {language: {name: 'us'}, layout: {name: 'pc105'}};
						
						if ($stateParams.isNewEnv || $stateParams.softwareId !== null) {
							result = $http.get(localConfig.data.eaasBackendURL + formatStr(startEnvWithSoftwarePackage, $stateParams.envId, $stateParams.softwareId,
									   kbLayoutPrefs.language.name, kbLayoutPrefs.layout.name))
						} else if ($stateParams.isNewObjectEnv) {
							result = $http.get(localConfig.data.eaasBackendURL + formatStr(startEnvWithDigitalObjectUrl, $stateParams.objectId, $stateParams.envId,
									   kbLayoutPrefs.language.name, kbLayoutPrefs.layout.name))
						}
						else {
							result = $http.get(localConfig.data.eaasBackendURL + formatStr(configureEnv, $stateParams.envId,
									   kbLayoutPrefs.language.name, kbLayoutPrefs.layout.name));
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
						controller: function ($scope, $window, $state, $http, $uibModal, $stateParams, configureEnv, growl, localConfig, $timeout, $translate, $pageVisibility) {
							var vm = this;
							
							vm.isNewEnv = $stateParams.isNewEnv;
							vm.isNewObjectEnv = $stateParams.isNewObjectEnv;
							
							vm.stopEmulator = function () {
								$http.get(localConfig.data.eaasBackendURL + formatStr(stopUrl, configureEnv.data.id)).then(function(response) {
									if (response.data.status === "0") {
										growl.success(response.data.message, {title: $translate.instant('JS_ACTIONS_SUCCESS')});
									} else {
										growl.error(response.data.message, {title: 'Error ' + response.data.status});
									}
									
									$state.go('wf-s.standard-envs-overview');
								});
							};
							
							vm.restartEmulator = function() {
								$http.get(localConfig.data.eaasBackendURL + formatStr(stopUrl, configureEnv.data.id))['finally'](function() {
									$state.reload();
								});
							};
						
							vm.screenshot = function() {
								 window.open(localConfig.data.eaasBackendURL + formatStr(screenshotUrl, configureEnv.data.id), '_blank', ''); 
							};
							
							vm.openSaveEnvironmentDialog = function() {
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
												postResult = $http.post(localConfig.data.eaasBackendURL + saveNewObjectEnvironmentUrl, {
													sessionId: configureEnv.data.id,
													envId: $stateParams.envId,
													objectId: $stateParams.objectId,
													title: this.envName,
													description: this.envDescription												
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
							
							vm.sessionId = configureEnv.data.id;
							
							var closeEmulatorOnTabLeaveTimer = null;
							var leaveWarningShownBefore = false;
							/*
							var deregisterOnPageFocused = $pageVisibility.$on('pageFocused', function() {								
								$timeout.cancel(closeEmulatorOnTabLeaveTimer);
							});

							var deregisterOnPageBlurred = $pageVisibility.$on('pageBlurred', function() {
								if (!leaveWarningShownBefore) {
									$window.alert($translate.instant('JS_EMU_LEAVE_PAGE'));
									leaveWarningShownBefore = true;
								}
								
								closeEmulatorOnTabLeaveTimer = $timeout(function() {
									vm.stopEmulator();
								}, 3 * 60 * 1000);
							});
							
							$scope.$on("$destroy", function() {
								deregisterOnPageFocused();
								deregisterOnPageBlurred();
							});
							*/
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
