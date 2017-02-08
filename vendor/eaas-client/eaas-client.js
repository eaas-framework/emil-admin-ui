var EaasClient = EaasClient || {};

EaasClient.Client = function(api_entrypoint, container) {
  var API_URL = api_entrypoint.replace(/([^:])(\/\/+)/g, '$1/');
  var container = container;

  function formatStr(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };

  this.pollState = function(controlurl, componentId) {
    $.get(controlurl + "/state")
      .done(function (data) {
        if (data.state == "running") {
          if (!this.guac) {
            this.establishGuacamoleTunnel(controlurl);
            this.keepaliveIntervalId = setInterval(this.keepalive.bind(this, componentId), 1000);

            if (this.onConnect) {
              this.onConnect();
            }
          }
          setTimeout(this.pollState.bind(this), 1000, controlurl, componentId);
        } else if (data.state == "failed") {
          this._onError("An internal server error occurred");
        } else if (data.state == "client_fault") {
          this._onError("A client error occurred");
        } else if (data.state == "stopped") {
          this._onError("The emulator was stopped");
        } else {
          setTimeout(this.pollState.bind(this), 1000, controlurl, componentId);
        }
      }.bind(this))
      .fail(function(xhr, textStatus, error) {
        this._onError("Could not determine component state");
      }.bind(this));
  }

  this._onError = function(msg) {
    if (this.keepaliveIntervalId)
      clearInterval(this.keepaliveIntervalId);
    if (this.guac)
      this.guac.disconnect();
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

  this.keepalive = function(componentId) {
    var keepalive = "/{0}/keepalive";

    $.post(API_URL + formatStr(keepalive, componentId));
  }

  this.establishGuacamoleTunnel = function(controlUrl) {
    window.onbeforeunload = function() {
        this.guac.disconnect();
    }.bind(this);

    $.fn.focusWithoutScrolling = function() {
        var x = window.scrollX, y = window.scrollY;
        this.focus();
        window.scrollTo(x, y);
        return this;
    };
       
    this.guac = new Guacamole.Client(new Guacamole.HTTPTunnel(controlUrl + "/tunnel"));
    var displayElement = this.guac.getDisplay().getElement();

    BWFLA.hideClientCursor(this.guac);
    container.prepend(displayElement);

    BWFLA.registerEventCallback(this.guac.getDisplay(), 'resize', this._onResize.bind(this));
    this.guac.connect();

    var mouse = new Guacamole.Mouse(displayElement);
    var touch = new Guacamole.Mouse.Touchpad(displayElement);
    var mousefix = new BwflaMouse(this.guac);

    //touch.onmousedown = touch.onmouseup = touch.onmousemove =
    //mouse.onmousedown = mouse.onmouseup = mouse.onmousemove =
    //function(mouseState) { guac.sendMouseState(mouseState); };

    mouse.onmousedown = touch.onmousedown = mousefix.onmousedown;
    mouse.onmouseup = touch.onmouseup = mousefix.onmouseup;
    mouse.onmousemove = touch.onmousemove = mousefix.onmousemove;

    var keyboard = new Guacamole.Keyboard(displayElement);

    keyboard.onkeydown = function (keysym) { this.guac.sendKeyEvent(1, keysym); }.bind(this);
    keyboard.onkeyup = function (keysym) { this.guac.sendKeyEvent(0, keysym); }.bind(this);

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
          this.pollState(data.iframeurl.replace(/([^:])(\/\/+)/g, '$1/'), data.id);
        } else {
          this._onError(data.message);
        }
      }.bind(this))
      .fail(function(xhr, textStatus, error) {
        this._onError($.parseJSON(xhr.responseText).message);
      }.bind(this));
  }
}
/*
 *  Example usage:
 *
 *      var centerOnScreen = function(width, height) {
 *          ...
 *      }
 *
 *      var resizeIFrame = function(width, height) {
 *          ...
 *      }
 *
 *      BWFLA.registerEventCallback(<target-1>, 'resize', centerOnScreen);
 *      BWFLA.registerEventCallback(<target-2>, 'resize', centerOnScreen);
 *      BWFLA.registerEventCallback(<target-2>, 'resize', resizeIFrame);
 */

var BWFLA = BWFLA || {};

// Method to attach a callback to an event
BWFLA.registerEventCallback = function(target, eventName, callback)
{
  var event = 'on' + eventName;

  if (!(event in target)) {
    console.error('Event ' + eventName + ' not supported!');
    return;
  }

  // Add placeholder for event-handlers to target's prototype
  if (!('__bwFlaEventHandlers__' in target))
    target.constructor.prototype.__bwFlaEventHandlers__ = {};

  // Initialize the list for event's callbacks
  if (!(event in target.__bwFlaEventHandlers__))
    target.__bwFlaEventHandlers__[event] = [];

  // Add the new callback to event's callback-list
  var callbacks = target.__bwFlaEventHandlers__[event];
  callbacks.push(callback);

  // If required, initialize handler management function
  if (target[event] == null) {
    target[event] = function() {
      var params = arguments;  // Parameters to the original callback

      // Call all registered callbacks one by one
      callbacks.forEach(function(func) {
        func.apply(target, params);
      });
    };
  }
};


// Method to unregister a callback for an event
BWFLA.unregisterEventCallback = function(target, eventName, callback)
{
  // Look in the specified target for the callback and
  // remove it from the execution chain for this event

  if (!('__bwFlaEventHandlers__' in target))
    return;

  var callbacks = target.__bwFlaEventHandlers__['on' + eventName];
  if (callbacks == null)
    return;

  var index = callbacks.indexOf(callback);
  if (index > -1)
    callbacks.splice(index, 1);
};

/** Custom mouse-event handlers for use with the Guacamole.Mouse */
var BwflaMouse = function(client)
{
  var events = [];
  var handler = null;
  var waiting = false;


  /** Adds a state's copy to the current event-list. */
  function addEventCopy(state)
  {
    var copy = new Guacamole.Mouse.State(state.x, state.y, state.left,
        state.middle, state.right, state.up, state.down);

    events.push(copy);
  }

  /** Sets a new timeout-callback, replacing the old one. */
  function setNewTimeout(callback, timeout)
  {
    if (handler != null)
      window.clearTimeout(handler);

    handler = window.setTimeout(callback, timeout);
  }

  /** Handler, called on timeout. */
  function onTimeout()
  {
    while (events.length > 0)
      client.sendMouseState(events.shift());

    handler = null;
    waiting = false;
  };


  /** Handler for mouse-down events. */
  this.onmousedown = function(state)
  {
    setNewTimeout(onTimeout, 100);
    addEventCopy(state);
    waiting = true;
  };

  /** Handler for mouse-up events. */
  this.onmouseup = function(state)
  {
    setNewTimeout(onTimeout, 150);
    addEventCopy(state);
    waiting = true;
  };

  /** Handler for mouse-move events. */
  this.onmousemove = function(state)
  {
    if (waiting == true)
      addEventCopy(state);
    else client.sendMouseState(state);
  };
};

var BWFLA = BWFLA || {};


/** Requests a pointer-lock on given element, if supported by the browser. */
BWFLA.requestPointerLock = function(target, event)
{
  function lockPointer() {
    var havePointerLock = 'pointerLockElement' in document
                          || 'mozPointerLockElement' in document
                          || 'webkitPointerLockElement' in document;

    if (!havePointerLock) {
      var message = "Your browser does not support the PointerLock API!\n"
                + "Using relative mouse is not possible.\n\n"
                + "Mouse input will be disabled for this virtual environment.";

      console.warn(message);
      alert(message);
      return;
    }

    // Activate pointer-locking
    target.requestPointerLock = target.requestPointerLock
                                || target.mozRequestPointerLock
                                || target.webkitRequestPointerLock;

    target.requestPointerLock();
  };

  function enableLockEventListener()
  {
    target.addEventListener(event, lockPointer, false);
  };

  function disableLockEventListener()
  {
    target.removeEventListener(event, lockPointer, false);
  };

  function onPointerLockChange() {
    if (document.pointerLockElement === target
        || document.mozPointerLockElement === target
        || document.webkitPointerLockElement === target) {
      // Pointer was just locked
      console.debug("Pointer was locked!");
      target.isPointerLockEnabled = true;
      disableLockEventListener();
    } else {
      // Pointer was just unlocked
      console.debug("Pointer was unlocked.");
      target.isPointerLockEnabled = false;
      enableLockEventListener();
    }
  };

  function onPointerLockError(error) {
    var message = "Pointer lock failed!";
    console.warn(message);
    alert(message);
  }

  // Hook for pointer lock state change events
  document.addEventListener('pointerlockchange', onPointerLockChange, false);
  document.addEventListener('mozpointerlockchange', onPointerLockChange, false);
  document.addEventListener('webkitpointerlockchange', onPointerLockChange, false);

  // Hook for pointer lock errors
  document.addEventListener('pointerlockerror', onPointerLockError, false);
  document.addEventListener('mozpointerlockerror', onPointerLockError, false);
  document.addEventListener('webkitpointerlockerror', onPointerLockError, false);

  enableLockEventListener();

  // Set flag for relative-mouse mode
  target.isRelativeMouse = true;
};


/** Hides the layer containing client-side mouse-cursor. */
BWFLA.hideClientCursor = function(guac)
{
  var display = guac.getDisplay();
  display.showCursor(false);
};


/** Shows the layer containing client-side mouse-cursor. */
BWFLA.showClientCursor = function(guac)
{
  var display = guac.getDisplay();
  display.showCursor(true);
};
