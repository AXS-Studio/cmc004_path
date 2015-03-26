function patientEmailCopy(firstName, password, email) {
	/*
		
		Instructions:
		
		Follow along with the sequence below if you'd like to add/remove lines to the 
		NEW/UPDATED PATIENT ACCOUNT email that goes out whenever a new MHT 
		patient account is created.
		
		Whenever you would like to add a line of text, start a new line, enter:
		
		copy += '';
		
		...and fill in your copy between the two '' markers.
		
		If you'd like to start a new line, enter:
		
		copy += newLine;
		
		If you’d like to start a new paragraph, enter:
		
		copy += newParagraph;
		
		Just to be safe, it's a good idea to make a duplicate/back-up copy of this original 
		file just in case something goes wrong and you need to revert back. Always keep 
		a back-up copy of this file.
		
	*/
	var newLine = '%0D%0A';
	var newParagraph = '%0D%0A%0D%0A';
	var copy = 'Hello ' + firstName + ',';
	copy += newParagraph;
	copy += 'An MHTVP account has been created/updated for you.';
	copy += newLine;
	copy += 'Please visit the following link to create/update your password:';
	copy += newLine;
	copy += 'https://path.sunnybrook.ca/mhtvp/?n=' + password;
	copy += newParagraph;
	copy += 'You can then visit https://path.sunnybrook.ca/mhtvp/';
	copy += newLine;
	copy += 'to log in using your email address and password.';
	copy += newParagraph;
	copy += 'Sincerely,';
	copy += newLine;
	copy += 'MHTVP System Administrator';
	return copy;
}