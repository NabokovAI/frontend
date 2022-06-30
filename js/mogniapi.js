let baseurl = "https://nabokovai.herokuapp.com/"

async function getExampleFacts() {
	let url = baseurl + "example_facts"
	let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    let body = await response.json();
    return body
}


async function postParseFacts(title, text) {
	let url = baseurl + "parse_facts"
	let response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			"title": title,
			"text": text
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	let body = await response.json();
	return body
}


async function postFactsToParagraph(title, facts, tone) {
	let url = baseurl + "facts_to_paragraph"
	let response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			'title': title,
			'facts': facts,
			'tone': tone 
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	let body = await response.json();
	return body
}


// Google results scrape

async function postFindSourceLinks(topic) {
	let url = baseurl + "find_source_links"
	let response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			'topic': topic,
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	let body = await response.json();
	return body
}


async function postScrapeArticle(scrapeurl) {
	let url = baseurl + "scrape_article"
	let response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			'url': scrapeurl,
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	let body = await response.json();
	return body
}


// Special Food Truck 


async function postFoodTruckParseFacts(name, description) {
	let url = baseurl + "foodtruck_parse_facts"
	let response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			'name': name,
			'description': description
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	let body = await response.json();
	return body
}


async function postFoodTruckFactsToParagraph(name, facts) {
	let url = baseurl + "foodtruck_facts_to_paragraph"
	let response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			'name': name,
			'facts': facts
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	let body = await response.json();
	return body
}


async function postFoodTruckParseDBFacts(name, is_dairy_free, 
	is_gluten_free, is_halal, is_vegan, is_vegetarian, item_name, item_description) {
	let url = baseurl + "foodtruck_parse_db_facts"
	let response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			'name': name,
			'is_dairy_free': is_dairy_free,
			'is_gluten_free': is_gluten_free,
			'is_halal': is_halal,
			'is_vegan': is_vegan,
			'is_vegetarian': is_vegetarian,
			'item_name': item_name,
			'item_description': item_description,
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	let body = await response.json();
	return body
}