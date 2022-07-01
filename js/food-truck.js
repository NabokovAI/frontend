function displayProvidedParagraph(paragraph) {
	const paragraphElem = document.getElementById("foodtruckdescriptiondiv");
	paragraphElem.innerText = paragraph;
	// add source
	// <a href="#" class="card-link">Source</a>
}


function displayDBData(dbdata) {
	const databaseUL = document.getElementById('dbdataholder')	
	for (const data in dbdata) {
		let dataElem = document.createElement("li");
		dataElem.innerText = `${data}: ${dbdata[data]}`;
		dataElem.classList.add("list-group-item");
		databaseUL.appendChild(dataElem);
	}
}


function clearResults() {
	deleteChildren('dbdataholder');
	deleteChildren('dbfactlist');
	deleteChildren('paragraphFactList');
}


function showCards() {
	document.getElementById('sourceslabel').hidden = false;
	let cards = document.getElementsByClassName("card");
	for (const idx in cards) {
		cards[idx].hidden = false;
	}
}


async function runTruck() {
	const name = document.getElementById('foodtruckselect').selectedOptions[0].value;
	let foodtruck = null;
	foodtrucks.forEach(function(truck) {
		if (truck['name'] === name) {
			foodtruck = truck;
		}
	})
	clearResults();
	displayProvidedParagraph(foodtruck['description'])
	displayDBData(foodtruck['dbdata']);
	showCards();

	let facts = await writeFoodTruckFacts();
	writeFoodTruckParagraph(facts);
}


function createTruckSelect(truck) {
	elem = document.createElement("option");
	elem.setAttribute("value", truck['name']);
	elem.innerText = truck['name'];
	return elem
}


function loadTrucks() {
	const foodtruckselect = document.getElementById("foodtruckselect");
	foodtrucks.forEach(function(truck) {
		truckSelect = createTruckSelect(truck);
		foodtruckselect.appendChild(truckSelect);
	})
}


function appendFacts(facts, ulid) {
	table = document.getElementById(ulid);
	facts.forEach(function(fact) {
		lielem = document.createElement('li');
		lielem.classList.add("list-group-item");
		lielem.innerText = fact;
		table.appendChild(lielem);
	})
}


function deleteChildren(ulid) {
	let ulelem = document.getElementById(ulid);
	while (ulelem.lastElementChild) {
        ulelem.removeChild(ulelem.lastElementChild)
    };
}


async function selectedTruck() {
	const name = document.getElementById('foodtruckselect').selectedOptions[0].value;
	let foodtruck = null;
	await foodtrucks.forEach(function(truck) {
		if (truck['name'] === name) {
			foodtruck = truck;
		}
	})
	return foodtruck
}


async function writeDBFacts(foodtruck) {
	deleteChildren('dbfactlist');
	let dbdata = foodtruck['dbdata'];
	let dbfacts = await postFoodTruckParseDBFacts(
		foodtruck['name'], 
		dbdata['is_dairy_free'], 
		dbdata['is_gluten_free'], 
		dbdata['is_halal'], 
		dbdata['is_vegan'], 
		dbdata['is_vegetarian'], 
		dbdata['featured_item_name'], 
		dbdata['featured_item_description']
	)
	await appendFacts(dbfacts['facts'], 'dbfactlist');
	return dbfacts['facts']
}


async function writeDescriptionFacts(foodtruck) {
	const facts = await postFoodTruckParseFacts(
		foodtruck['name'], foodtruck['description']);

	await deleteChildren('paragraphFactList')
	appendFacts(facts['facts'], 'paragraphFactList');
	return facts['facts']
}


async function writeFoodTruckFacts() {
	let dbspinner = document.getElementById("getDBFactsSpinner");
	dbspinner.hidden = false;

	let descriptionspinner = document.getElementById("getDescriptionFactsSpinner");
	descriptionspinner.hidden = false;

	let foodtruck = await selectedTruck();

	let dbfacts = await writeDBFacts(foodtruck);
	dbspinner.hidden = true;

	let descriptionFacts = await writeDescriptionFacts(foodtruck)
	descriptionspinner.hidden = true;

	return dbfacts.concat(descriptionFacts)
}


function selectChildText(ulid) {
	let ulelem = document.getElementById(ulid);
	let children = ulelem.children;
	let facts = [];
	for (lielem of children) {
        facts.push(lielem.innerText)    
    }
	return facts
}


function selectFacts() {
	let facts = selectChildText('paragraphFactList');
	return facts.concat(selectChildText('dbfactlist'))
}


async function writeFoodTruckParagraph(facts) {
	document.getElementById('paragraphresultsdiv').hidden = false;
	let spinner = document.getElementById('getparagraphresultsspinner');
	spinner.hidden = false
	let foodtruck = await selectedTruck();
	let name = foodtruck['name'];

	console.log(facts);

	res = await postFoodTruckFactsToParagraph(name, facts);
	let paragraph = res['paragraph'];
	let paragraphElem = document.getElementById('generatedparagraph');
	paragraphElem.innerText = paragraph;
	spinner.hidden = true;
}


function testpostFoodTruckParseFacts(topic, text) {
    return {
      "facts": [
        "The llama is a domesticated South American camelid",
        "-The llama has been used as a meat and pack animal by Andean cultures for centuries",
        "-Llamas are social animals that live in herds",
        "-Llama wool is soft and contains very little lanolin",
        "-Llamas can learn simple tasks quickly",
        "-Llamas can carry up to 30% of their body weight for long distances",
        "-The name \"llama\" was adopted by European settlers from native Peruvians",
        "-Llama ancestors are thought to have originated in North America",
        "-Llama ancestors migrated to South America during the Great American Interchange",
        "-Camelids were extinct in North America by the end of the last ice age",
        "-As of 2007, there were over 7 million llamas and alpacas in South America"
      ]
    }
}

function testpostFoodTruckFactsToParagraph(name, facts) {
	return { "paragraph": "Mustache Pretzels is a delicious food truck that offers a variety of pretzels, dips, and queso. The menu is full of fresh and locally grown ingredients that are sure to please everyone at your event. Catering events has never been easier or tastier!"}
}



function loadDescriptions() {
	let rows = document.getElementById("truckdescriptionrows");
	descriptions.forEach(function(truck) {
		// <tr>
    //   <th scope="row">1</th>
    //   <td>Mark</td>
    //   <td>Otto</td>
    //   <td>@mdo</td>
    // </tr>
    let rowholder = document.createElement("tr");
    let thelem = document.createElement("td");
    thelem.innerText = truck['Name'];
    thelem.setAttribute("scope", "row");
    rowholder.appendChild(thelem);
    
    let descriptionelem = document.createElement("td");
    descriptionelem.innerText = truck["Description"]
    rowholder.appendChild(descriptionelem);

    let rhelem = document.createElement("td");
    rhelem.innerText = truck["Roaming Hunger"];
    rowholder.appendChild(rhelem);

    let factselem = document.createElement("td");
    factselem.innerText = truck["Facts"]
    rowholder.appendChild(factselem);
    rows.appendChild(rowholder);
	})
}
