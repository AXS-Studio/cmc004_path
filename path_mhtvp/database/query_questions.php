<?php
session_start();
require_once("database.php");

$jsonArray = array(); //Final array returned for AJAX

$bus = array();

$MC5Array = array();
$MC2Array = array();
$VASArray = array();
$AGGREGATEArray = array();

global $mysqli;
$q = "SELECT `QuestionID`,`Description` FROM `Questions` ORDER BY `Order`";
if ($result = $mysqli->query($q)){	
	while($row = $result->fetch_assoc()){
	
		$bus['id'] = $row['QuestionID'];
		$bus['name'] = $row['Description'];
		
		//Get question type
		$arr = explode("_", $bus['id'], 2);
		$questionType = $arr[0];
		//Format question description
		$arr = explode("_", $bus['name'], 2);
		$bus['name'] = $arr[1];
		
		//Push into correct array
		if ($questionType == 'VAS'){
			array_push($VASArray, $bus);
		}
		else if ($questionType == 'MC5'){
			array_push($MC5Array, $bus);
		}
		else if ($questionType == 'MC2'){
			array_push($MC2Array, $bus);
		}
		else if ($questionType == 'SCORE'){
			array_push($AGGREGATEArray, $bus);
		}
		unset($bus);
	}//end while
	$result->free();
	
	//Produce finalized json array for output
	$bus["category"] = "MC5";
	$bus["type"] = $MC5Array;
	array_push($jsonArray, $bus);
	unset($bus);
	
	$bus["category"] = "MC2";
	$bus["type"] = $MC2Array;
	array_push($jsonArray, $bus);
	unset($bus);
	
	$bus["category"] = "VAS";
	$bus["type"] = $VASArray;
	array_push($jsonArray, $bus);
	unset($bus);
		
	$AGGREGATEArray["id"] = "SCORE_0";
	$AGGREGATEArray["name"] = "Score";
	
	$bus["category"] = "Aggregate Scores";
	$bus["type"] = $AGGREGATEArray;
	array_push($jsonArray, $bus);
	unset($bus);
}
else{
	$jsonArray["error"] = 'Database error: '.$mysqli->error;;
}

echo json_encode($jsonArray);
exit();

/*For reference: final json array for front-end display of question list
[{
   "category": "ASRM",
   "type": [
			{
					"id": "fa",
					"name": "Falling asleep"
			},
			{
					"id": "sdtn",
					"name": "Sleep during the night"
			},
			{
					"id": "wute",
					"name": "Waking up too early"
			}
	]
},
{
	"category": "QIDS",
	"type": [
			{
					"id": "fa",
					"name": "Falling asleep"
			},
			{
					"id": "sdtn",
					"name": "Sleep during the night"
			},
			{
					"id": "wute",
					"name": "Waking up too early"
			}
	]
},
{
	"category": "VAS",
	"type": [
			{
					"id": "fa",
					"name": "Falling asleep"
			},
			{
					"id": "sdtn",
					"name": "Sleep during the night"
			},
			{
					"id": "wute",
					"name": "Waking up too early"
			}
	]
 }]
*/
?>