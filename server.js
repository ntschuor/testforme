const mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  port     : 3306,
  user     : 'root',
  password : 'root',
  database : 'toasttagging'
});
const express = require('express');
const app = express();

// Use static resources in public folder (HTML, CSS, JS)
app.use(express.static('public'));

/**
 * Type: GET
 * Directory: localhost:3000/api/systemslist
 * Parameters: systemslist - displays all of the system rows.
 * 			   systemslist?offset=x - displays the first x rows.
 * 			   systemslist?offset=x&start=y - displays the first x rows starting at entry y.
 * The usage of the offset and start parameters can be useful if we want to have
 * pages that display certain amounts of rows per page. eg. display 10 systems
 * per page and easily navigate through different pages to calculate the offsets and starting entries.
 */
app.get('/api/systemslist', function (req, res) {
	var queryText = "SELECT * FROM system";
	if (req.query.offset != null && req.query.start == null)
		queryText += " LIMIT " + req.query.offset;
	else if (req.query.offset != null && req.query.start != null)
		queryText += " LIMIT " + (req.query.start - 1) + ", " + req.query.offset;
	connection.query(queryText, function(error, results, fields) {
		res.send(results);
	});
});

/**
 * Type: GET
 * Directory: localhost:3000/api/groups
 * Parameters: groups?groupID=x - displays all the systems associated with group id x.
 * This endpoint displays all of the system that are
 * associated with the provided system group id that
 * corresponds in the systemgroups junction table.
 */
app.get('/api/groups', function (req, res) {
	if (groupID != null) {
		connection.query("SELECT * FROM system WHERE serialNumber IN (SELECT system_id FROM systemgroups WHERE systemgroup_id = " + req.query.groupID + ");", function(error, results, fields) {
			res.send(results);
		});
	}
});

/**
 * Type: POST
 * Directory: localhost:3000/api/tags
 * Parameters: tags?tagID=x&... - Modifies the following value(...) for the given tagID.
								  name, user_id, visibility can be used individually or 
								  in a combined sense (eg. name=x&visibility=y)
 * This endpoint modifies a mix and match of 
 * the name, user_id, and visibility fields for
 * the tag associated with the tagID.
 */
app.post('/api/tags', function (req, res) {
	if (req.query.tagID != null) {
		var queryStart = "UPDATE tag SET ";
		var queryEnd = "WHERE id = " + req.query.tagID + ";";
		if (req.query.name != null) {
			connection.query(queryStart + "name = " + req.query.name + " " + queryEnd, function(error, results, fields) {});
		}
		if (req.query.user_id != null) {
			connection.query(queryStart + "user_id = " + req.query.user_id + " " + queryEnd, function(error, results, fields) {});
		}
		if (req.query.visibility!= null) {
			connection.query(queryStart + "visibility = " + req.query.visibility+ " " + queryEnd, function(error, results, fields) {});
		}
	}
});

/**
 * Type: GET
 * Directory: localhost:3000/api/tags
 * Parameters: tags?serial_id=x - displays the tags associated to the systems with an id of x.
			   tags?tagID=x 	- displays the systems associated with the tag with an id of x.
 * Given a provided serial_id representing the id of a system, we are
 * returning all of the tag data that is associated with the system id.
 * This utilizes the junction table systemtags that has the relationships
 * of the system_id:tag_id. Providing a tagID instead of a serial_id does 
 * the opposite of this process.
 */
app.get('/api/tags', function (req, res) {
	if (req.query.serial_id != null) {
		connection.query("SELECT * FROM tag WHERE id IN (SELECT tag_id FROM systemtags WHERE system_id = " + req.query.serial_id + ");", function(error, results, fields) {
			res.send(results);
		});
	} else if (req.query.tagID != null) {
		connection.query("SELECT * FROM system WHERE serialNumber IN (SELECT system_id FROM systemtags WHERE tag_id = " + req.query.tagID + ");", function(error, results, fields) {
			res.send(results);
		});
	}
});


/**
 * Type: POST
 * Directory: localhost:3000/api/tags
 * Parameters: tags?serial_id=w&name=x&user_id=y&visibility=z - Adds a tag entry to the tag table with name x, user id y, 
 * 													and visibility z. This tag is then added to system w.
 * This adds a new tag entry to the tag table of our database. The id is a primary key
 * and will automatically increment every new entry, meaning that the id's will stay unique.
 * All three parameters are required since we don't want nulled data, web page will respond if
 * the syntax is incorrect. This also adds the tag to the junction table corresponding to the system id.
 */
app.post('/api/tags', function (req, res) {
	var serial_id = req.query.serial_id;
	var name = req.query.name;
	var user_id = req.query.user_id;
	var visibility = req.query.visibility;
	if (name != null && user_id != null && visibility != null) {
		connection.query("INSERT INTO tag (name, user_id, visibility) VALUES ('" + name + "', " + user_id + ", " + visibility + ")", function(error, results, fields) {
		});
		connection.query("INSERT INTO systemtags (system_id, tag_id) VALUES ('" + serial_id + "', '(SELECT id FROM tag ORDER BY ID DESC LIMIT 1)')", function(error, results, fields) {
			res.send("Successfully added the tag to the database!");
		});
	} else {
		res.send("Invalid syntax, missing correct parameters.");
	}
});

/**
 * Type: DELETE
 * Directory: localhost:3000/api/groups
 * Parameters: groups/groupID=x - Removes the system group with the id of x.
 * This removes the system group with the provided id. Not only
 * does this remove the entry from the systemgroup table, but
 * also the systemgroup:system relationship for all of the entries
 * in the junction table systemgroups that correspond to the provided
 * system group id.
 */
app.delete('/api/groups', function (req, res) {
	if (req.query.groupID != null) {
		connection.query("DELETE FROM systemgroup WHERE id = " + req.query.groupID + ";", function(error, results, fields) {});	
		connection.query("DELETE FROM systemgroups WHERE systemgroup_id = " + req.query.groupID + ";", function(error, results, fields) {
			res.send(results);
		});	
	}
});

// Provides information about a system based off of the given serialNumber
app.get('/api/systems', function (req, res) {
	connection.query("SELECT * FROM system WHERE serialNumber = "+ req.query.serialNumber, function(error, results, fields) {
		res.send(results);
	});
});

app.listen(3000, () => console.log('http://localhost:3000/'))