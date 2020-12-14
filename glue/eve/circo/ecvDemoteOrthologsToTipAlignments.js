// ABOUT: script to populate ECV tips within constrained alignment
// ECV sequences are added to alignments based on the taxonomic data associated with 
// the reference sequences.
// ECV sequences are linked to reference sequences via the locus ID

// Preset variables
var refconDataPath = "tabular/eve/ecv-circo-refseqs-side-data.tsv";
var rootAlignment = 'AL_Circovirus';

// Load the refcon data and store relationships between locus and viral taxonomy
var ecvRefseqResultMap = {};
get_refcon_data(ecvRefseqResultMap, refconDataPath);
//glue.log("INFO", "RESULT WAS ", ecvRefseqResultMap);


// Load DIGS hit data from tabular file 
var loadResult;
glue.inMode("module/cressTabularUtility", function() {
	loadResult = glue.tableToObjects(glue.command(["load-tabular", "tabular/eve/ecv-circo-side-data.tsv"]));
	glue.log("INFO", "load result was:", loadResult);
});

// Iterate on DIGS data, adding sequences to alignments as appropriate
_.each(loadResult, function(eveObj) {

	// Get the locus ID
	var sequenceID = eveObj.sequenceID;
	var locus_name = eveObj.locus_name;
	var locus_numeric_id = eveObj.locus_numeric_id;
	var locusObj = ecvRefseqResultMap[locus_name];
	

	if (locus_numeric_id != 'NK') { // Skip elements that haven't been assigned to a locus

		glue.log("INFO", "Sequence ID", locus_name);
		glue.log("INFO", "Locus ID", locus_name);
		glue.log("INFO", "Locus numeric ID", locus_numeric_id);
	
		// Does an alignment exist for this locus ID
        var alignmentName = "AL_ECV-" + locus_name;

		glue.log("INFO", "Adding sequence:", eveObj.sequenceID);
		glue.log("INFO", "to alignment", alignmentName);
		glue.log("INFO", "genus:", locusObj.virus_genus);
		
		var parentAlignmentName;
				
	    var virus_genus = 'Circo';
		parentAlignmentName = "AL_" + virus_genus;

		glue.log("INFO", "PARENT ALIGNMENT: ", parentAlignmentName);

		var alignmentExists = does_alignment_exist(alignmentName);
	
		if (alignmentExists == undefined) { // If not create the alignment
			
			// Create the alignment
			var refseqName = "REF_ECV-" + locus_name;
			
			glue.log("INFO", "CREATING ALIGNMENT WITH CONSTRAINING REFERENCE: ", refseqName);
			glue.inMode("/alignment/"+parentAlignmentName, function() {
				glue.command(["extract", "child", alignmentName, "-r", refseqName]);
			});
					
		}	

		// Add the sequence to the alignment
		glue.inMode("/alignment/"+parentAlignmentName, function() {			
			glue.log("INFO", "ADDING sequence: ", sequenceID);
			glue.command(["demote", "member", alignmentName, "-w", "sequence.sequenceID = '"+sequenceID+"'"]);
		});
	
	}

});


//-~-~ SUBROUTINES

// get a list of sequence IDs from a given source in an alignment
function get_refcon_data(resultMap, refconDataPath) {

  // Load EVE reference data from tab file 
  var loadResult;
  glue.inMode("module/cressTabularUtility", function() {
	  loadResult = glue.tableToObjects(glue.command(["load-tabular", refconDataPath]));
	  glue.log("INFO", "load result was:", loadResult);
  });

  _.each(loadResult, function(eveObj) {

	  var source_name = eveObj.source_name
	  var sequenceID = eveObj.sequenceID
	  var locus_numeric_id = eveObj.locus_numeric_id;
	  var locus_name = eveObj.locus_name;
	  glue.log("INFO", "Setting locus data for EVE locus:", eveObj.locus_name);
	  resultMap[locus_name] = eveObj;
	
  });
  
}

// check whether an alignment exists
function does_alignment_exist(alignmentName) {

	var alignmentExists = undefined;
	// glue.log("INFO", "Checking for alignment ", alignmentName);

    alignmentResult = glue.tableToObjects(glue.command(["list", "alignment", "-w", "name = '"+alignmentName+"'"]));
	//glue.log("INFO", "list result was:", alignmentResult);

	var rowObj =  alignmentResult[0];
	if (rowObj) {
		alignmentExists = rowObj['name'];
		//glue.log("INFO", "got exists value:", alignmentExists);
	}
	
	return alignmentExists;
}

