(function() {
	function formatStr(format) {
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
	
	var getAllEnvsUrl = "getEmilEnvironments";
	var configureEnv = "configureEnv?envId={0}";
	var stopUrl = "stop?sessionId={0}";
	var screenshotUrl = "screenshot?sessionId={0}";
	var saveEnvConfiguration = "saveEnvConfiguration";
	
	angular.module('emilAdminUI', ['angular-loading-bar', 'ngSanitize', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.select', 'angular-growl', 'smart-table'])
		
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
								$state.go('error', {errorMsg: {title: "Load Environsments Error " + environmentList.data.status, message: environmentList.data.message}});
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
					softwareList: function($http) {
						return { 
							data: [
								{"title": "Microsoft Word", "softwareId": "1"},
								{"title": "Adobe Reader", "softwareId": "2"},
								{"title": "Adobe Photoshop", "softwareId": "3"},
								{"title": "Google Chrome", "softwareId": "4"}								
							]
						};
					}
				},
				views: {
					'wizard': {
						templateUrl: 'partials/wf-s/new-env.html',
						controller: function ($scope, $state, $stateParams, environmentList, softwareList, growl) {
							this.envs = environmentList.data.environments;
							this.software = softwareList.data;
							
							this.saveNew = function() {
								console.log(this.selected_env);
								console.log(this.selected_sw);
								
								// TODO save to server via post
							};
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
						controller: function ($scope, $state, $stateParams, environmentList, growl) {
							var envIndex = -1;
							for(var i = 0; i < environmentList.data.environments.length; i++) {
								if (environmentList.data.environments[i].envId === $stateParams.envId) {
									envIndex = i;
									break;
								}
							}
							
							this.envName = environmentList.data.environments[envIndex].title;
							this.envDescription = environmentList.data.environments[envIndex].description;
							this.envEmulator = environmentList.data.environments[envIndex].emulator;
							this.envOS = environmentList.data.environments[envIndex].os;
							
							this.saveEdit = function() {
								environmentList.data.environments[envIndex].title = this.envName;
								environmentList.data.environments[envIndex].description = this.envDescription;
								
								// TODO save to server via post
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
					isNewEnv: false
				},
				resolve: {
					configureEnv: function($http, $stateParams, localConfig) {
						return $http.get(localConfig.data.eaasBackendURL + formatStr(configureEnv, $stateParams.envId));
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
											$http.post(localConfig.data.eaasBackendURL + saveEnvConfiguration, {sessionId: configureEnv.data.id, messsage: this.envDescription}).then(function(response) {
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
			});
			
		growlProvider.globalTimeToLive(5000);
	});
})();