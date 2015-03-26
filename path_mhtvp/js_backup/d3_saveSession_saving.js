/* CREATE and SAVE a new session from the currently selected session */

{
	"clinicianID": "123456",
	"patientID": "abcdef",
	"session": null,
	"action": "new",
	"data": {
		"name": "Name of new session",
		"range1dates": [],
		"range2dates": [],
		"settings": []
	}
}

/* RENAME the currently selected session */

{
	"clinicianID": "123456",	
	"patientID": "abcdef",
	"session": "Current session",
	"action": "rename",
	"data": {
		"name": "New Name of current session"
	}
}

/* SAVE the currently selected session */

{
	"clinicianID": "123456",
	"patientID": "abcdef",
	"session": "Current session",
	"action": "save",
	"data": {
		"range1dates": [],
		"range2dates": [],
		"settings": []
	}
}

/* DELETE the currently selected session */

{
	"clinicianID": "123456",	
	"patientID": "abcdef",
	"session": "Current session",
	"action": "delete"
}

/* Going to need a new one: Load a previously saved session. */

{
	"clinicianID": "123456",	
	"patientID": "abcdef",
	"session": "Newly chosen session",
	"action": "get"
}