<?php
session_start();
require_once("query_answers_functions.php");

$answerArray = array(); //Array returned for each questionID
$jsonArray = array(); //Final array returned for AJAX

$patientID=$_REQUEST["patientID"];

$clinicianID=$_SESSION["userName"];
if($clinicianID == NULL)
$clinicianID=$_REQUEST["clinicianID"];

$sessionName=$_REQUEST["sessionName"];

$defaultQuestionArray = array("MC5_0","MC2_0","VAS_0","VAS_1"); //Array containing questionIDs to be queried

//QuestionIDs minus default set.
$fullQuestionArray = array(	"MC5_1","MC5_2","MC5_3","MC5_4","MC5_5","MC5_6","MC5_7","MC5_8","MC5_9","MC5_10","MC5_11","MC5_12","MC5_13","MC5_14",							
							"VAS_2","VAS_3","VAS_4","VAS_5","VAS_6","VAS_7","VAS_8","VAS_9","VAS_10",
							"VAS_11","VAS_12","VAS_13","VAS_14","VAS_15","VAS_16","VAS_17","VAS_18","VAS_19","VAS_20",
							"VAS_21","VAS_22","VAS_23");
							
//QuestionIDs.
$fullQuestionArray2 = array("MC5_0","MC5_1","MC5_2","MC5_3","MC5_4","MC5_5","MC5_6","MC5_7","MC5_8","MC5_9","MC5_10","MC5_11","MC5_12","MC5_13","MC5_14",
							"MC2_0",
							"VAS_0","VAS_1","VAS_2","VAS_3","VAS_4","VAS_5","VAS_6","VAS_7","VAS_8","VAS_9","VAS_10",
							"VAS_11","VAS_12","VAS_13","VAS_14","VAS_15","VAS_16","VAS_17","VAS_18","VAS_19","VAS_20",
							"VAS_21","VAS_22","VAS_23");
//-------------------------------------------------
//Grab sessions
$answerArray["id"] = "sessions";
$answerArray["info"] = getSessions($patientID, $clinicianID, $sessionName);
array_push($jsonArray, $answerArray);

//Grab QuestionIDs if loading up a session
$sessionQuestionArray = array();
$sessionColourArray = array(); //&& $answerArray["info"]["current"]['data'] != NULL
if (isset($sessionName) ){
	//Now get data sets for which the clinician was last looking at
	$dataArray = $answerArray["info"]["current"]['data']['settings'];
	for($i=0; $i<sizeof($dataArray); $i++) {
		if ($dataArray[$i]['colour'] != 'transparent'){
			$sessionQuestionArray[] = $dataArray[$i]['id'];
			$sessionColourArray[] = $dataArray[$i]['colour'];
		}
	}
	//$jsonArray['test'][] = $sessionQuestionArray;
}
				
//-------------------------------------------------
//Grab initial load of data
unset($answerArray);

if ($sessionQuestionArray != NULL){
	$questionArray = $sessionQuestionArray;
	$colourArray = $sessionColourArray;
}
else{
	$questionArray = $defaultQuestionArray;
	$colourArray = null;
}

for ($i = 0; $i < count($questionArray); $i++){
	$questionID = $questionArray[$i];
	
	$answerArray['id'] = $questionID;
	
	if ($colourArray!= null)
	$answerArray['colour'] = $colourArray[$i];//will be rgba(255,0,0,1.0) format
	else
	$answerArray['colour'] = null;
	
	$answerArray['name'] = getDescription($questionID);
	
	if ($questionID == "SCORE_0")
	$answerArray['name'] = "SCORE_Depression";
	
	//Get question type
	$arr = explode("_", $answerArray['id'], 2);
	$questionType = $arr[0];
	
	//Push in the answers and get length of array
	$answerArray["results"] = getAnswers($patientID, $questionID, $questionType);
	$answerArray["length"] = count($answerArray["results"]);
	array_push($jsonArray, $answerArray);
}
//-------------------------------------------------
//Grab questions that aren't null
unset($answerArray);
for ($i = 0; $i < count($fullQuestionArray2); $i++){
	
	if (!in_array($fullQuestionArray2[$i], $questionArray)){
		$answerArray["id"] = $fullQuestionArray2[$i];
		$answerArray["length"] = answerLength($fullQuestionArray2[$i], $patientID);
		array_push($jsonArray, $answerArray);
	}
}

//-------------------------------------------------
//Grab comments
unset($answerArray);
$answerArray["id"] = "comment";
$answerArray["results"] = getComments($patientID);
$answerArray["length"] = count($answerArray["results"]);
array_push($jsonArray, $answerArray);

//-------------------------------------------------
//Grab clinician notes
unset($answerArray);
$answerArray["id"] = "notes";
$answerArray["results"] = getClinicianNotes($patientID, $clinicianID);
$answerArray["length"] = count($answerArray["results"]["notes"]);
array_push($jsonArray, $answerArray);

echo json_encode($jsonArray);
exit();
?>