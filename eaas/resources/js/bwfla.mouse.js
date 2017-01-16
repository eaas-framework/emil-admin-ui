
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
