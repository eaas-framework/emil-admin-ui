

var EaasClient = EaasClient || {};

EaasClient.Client = function(api_entrypoint, container) {
	var API_URL = api_entrypoint;
	var container = container;
	
	function formatStr(format) {
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
	
	
	this.pollState = function(controlurl) {
		$.get(controlurl + "/state")
			.done(function (data) {
				if (data.state == "running") {
					this.establishGuacamoleTunnel(controlurl + "/tunnel");
					if (this.onConnect) {
						this.onConnect();
					}
				} else if (data.state == "failed") {
					this._onError("An internal server error occurred");
				} else {
					setTimeout(this.pollState.bind(this), 1000, controlurl);
				}
			}.bind(this));
	}

	this._onError = function(msg) {
		if (this.onError) {
			this.onError(msg || "No error message specified");
		}
	}
	
	this._onResize = function(width, height) {
		container.style.width = width;
		container.style.height = height;
		
		if (this.onResize) {
			this.onResize(width, height);
		}
	}
	
	
	this.establishGuacamoleTunnel = function(tunnelUrl) {
        window.onbeforeunload = function()
        {
            guac.disconnect();
        }
       
        $.fn.focusWithoutScrolling = function()
        {
            var x = window.scrollX, y = window.scrollY;
            this.focus();
            window.scrollTo(x, y);
            return this;
        };
          
       
		var guac = new Guacamole.Client(new Guacamole.HTTPTunnel(tunnelUrl));
		var displayElement = guac.getDisplay().getElement();
		
		BWFLA.hideClientCursor(guac);
		container.prepend(displayElement);
		
		BWFLA.registerEventCallback(guac.getDisplay(), 'resize', this._onResize.bind(this));
		guac.connect(); 
		
		/*
		/window.addEventListener("message", function(event) {
			// any messeage will cause a fullscreen event for now
			screenfull.request(displayElement);	
		});
		*/
	
		var mouse = new Guacamole.Mouse(displayElement);
		var touch = new Guacamole.Mouse.Touchpad(displayElement);
		var mousefix = new BwflaMouse(guac);
	   
		//touch.onmousedown = touch.onmouseup = touch.onmousemove =
		//mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = 
		//function(mouseState) { guac.sendMouseState(mouseState); };
		
		mouse.onmousedown = touch.onmousedown = mousefix.onmousedown;
		mouse.onmouseup = touch.onmouseup = mousefix.onmouseup;
		mouse.onmousemove = touch.onmousemove = mousefix.onmousemove;
		
		var keyboard = new Guacamole.Keyboard(displayElement);
		
		keyboard.onkeydown = function (keysym) { guac.sendKeyEvent(1, keysym); };
		keyboard.onkeyup = function (keysym) { guac.sendKeyEvent(0, keysym); };
		
		$(displayElement).attr('tabindex', '0');
		$(displayElement).css('outline', '0');
		$(displayElement).mouseenter(function() {$(this).focusWithoutScrolling();});
		
		if (this.onReady) {
			this.onReady();
		}
		
		/*
		oskeyboard = new Guacamole.OnScreenKeyboard("/emucomp/resources/layouts/en-us-qwerty.xml");
		
		$('#keyboard-wrapper').addClass('keyboard-container');
		$('#keyboard-wrapper').html(oskeyboard.getElement());
		
		function resizeKeyboardTimer()
		{                                           
		    oskeyboard.resize($('#display > div').width()*0.95);
		    setTimeout(resizeKeyboardTimer, 200);
		}
		
		resizeKeyboardTimer();
		
		oskeyboard.onkeydown = function (keysym) { guac.sendKeyEvent(1, keysym); };
		oskeyboard.onkeyup = function (keysym) { guac.sendKeyEvent(0, keysym); };
		*/
	}
	
	
	
	this.startEnvironment = function(environmentId, kbLanguage, kbLayout) {
		var configureEnv = "/configureEnv?envId={0}&language={1}&layout={2}";

		$.get(API_URL + formatStr(configureEnv, environmentId,
				kbLanguage || "us", kbLayout || "pc105")).
			done(function (data) {
				if (data.status == 0) {
					this.pollState(data.iframeurl);
				} else {
					this._onError(data.message);
				}
			}.bind(this));
	}
}