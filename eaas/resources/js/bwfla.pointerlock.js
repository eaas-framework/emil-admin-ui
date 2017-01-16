
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
