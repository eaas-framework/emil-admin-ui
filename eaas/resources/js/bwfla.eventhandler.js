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
