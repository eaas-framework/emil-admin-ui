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
	
	angular.module('emilAdminUI', ['angular-loading-bar', 'ngSanitize', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.select', 'angular-growl', 'smart-table', 'ng-sortable'])
		
	.config(function($stateProvider, $urlRouterProvider, growlProvider, $httpProvider) {
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
						controller: function ($scope, $state, environmentList, growl) {
							if (environmentList.data.status !== "0") {
								$state.go('error', {errorMsg: {title: "Load Environments Error " + environmentList.data.status, message: environmentList.data.message}});
								return;
							}
						
							this.envs = environmentList.data.environments;
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
										
										vm.objEnvironments = response.data.environments;
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