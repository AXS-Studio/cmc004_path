var Forms = {
	patient: '<div class="row">\
									<label for="MedicalRecordNum">MRN</label>\
									<input type="text" name="MedicalRecordNum" id="MedicalRecordNum" placeholder="Medical Record Number" required>\
								</div>\
								<!-- end row -->\
								<div class="row">\
									<label for="FirstName">First name</label>\
									<input type="text" name="FirstName" id="FirstName" placeholder="First name" required>\
								</div>\
								<!-- end row -->\
								<div class="row">\
									<label for="LastName">Last name</label>\
									<input type="text" name="LastName" id="LastName" placeholder="Last name" required>\
								</div>\
								<!-- end row -->\
								<div class="row">\
									<label for="Email">Email address</label>\
									<input type="email" name="Email" id="Email" placeholder="Email address" required>\
								</div>\
								<!-- end row -->\
								<div class="row">\
									<label for="Password">Password</label>\
									<input type="text" name="Password" id="Password" placeholder="Password" required>\
								</div>\
								<!-- end row -->\
								<!-- <div class="row">\
									<label for="mrn">Confirm password</label>\
									<input type="password" name="mrn" id="mrn" placeholder="Confirm password" required>\
								</div>\
								end row -->\
								<div class="row">\
									<label for="mrn">Mobile phone number</label>\
									<input type="tel" name="PhoneNum" id="PhoneNum" placeholder="Phone #" required class="phone">\
								</div>\
								<!-- end row -->\
								<div class="row select">\
									<label for="PhoneCarrier">Mobile carrier</label>\
									<select name="PhoneCarrier" id="PhoneCarrier">\
										<option value="Select">--Select--</option>\
										<option value="Bell">Bell</option>\
										<option value="Chatr">Chatr</option>\
										<option value="Fido">Fido</option>\
										<option value="Koodoo">Koodoo</option>\
										<option value="Mobilicity">Mobilicity</option>\
										<option value="Public">Public</option>\
										<option value="Rogers">Rogers</option>\
										<option value="Telus">Telus</option>\
										<option value="Virgin">Virgin</option>\
										<option value="Wind">Wind</option>\
	                                    <option value="Other">Other</option>\
									</select>\
								</div>\
								<!-- end row -->\
								<div class="row">\
									<input type="hidden" name="Enabled" value="0">\
									<input type="checkbox" name="Enabled" id="Enabled" value="1" checked="checked" class="floatLeft">\
									<label for="Enabled">Account enabled</label>\
								</div>\
								<!-- end row -->\
								<div class="row submit">\
									<input type="submit" name="subCreatePatientAccount" id="subCreate" value="Submit">\
									<input type="submit" name="subDeletePatientAccount" id="subDelete" value="Delete" onclick="return deleteAlert();">\
									<input type="submit" name="subEmailPatientAccount" id="subEmail" value="Submit and Send Email" onclick="sendEmail();">\
								</div>',
	questionnaire: ''
};