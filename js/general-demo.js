function createDeleteButton() {
    // <button type="button" class="btn-close" aria-label="Close"></button>
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("btn-close");
    deleteButton.setAttribute("type", "button");
    deleteButton.onclick = function() {
        this.parentElement.remove();
    }
    return deleteButton;
}


function createSourceOption(source) {
    let sourceOption = document.createElement("option");
    sourceOption.innerText = source['title'];
    sourceOption.value = source['url'];
    return sourceOption;
}

function createSourceSelection(sources) {
    let sourceSelect = document.getElementById("source-select");
    sources.forEach(function(source) { 
        sourceElem = createSourceOption(source);
        sourceSelect.appendChild(sourceElem);
    })
}

function highlightArticle(article) {
    let url = article['url'];
    let sourceElems = document.getElementById('source-select').children;
    for (sourceElem of sourceElems) {
        if (sourceElem.value === url) {
            sourceElem.setAttribute("selected", true);
            return
        }        
    }
}


function createFactli(item) {
    // We're making this
    // <li class="list-group-item d-flex">
            // <p class="p-0 m-0 flex-grow-1">Llamas are larger than frogs</p>
            // <button type="button" class="btn-close" aria-label="Close"></button>
    // </li>
    let li = document.createElement("li");
    li.classList.add("list-group-item");
    li.classList.add("d-flex");
    let paragraph = document.createElement("p");
    paragraph.classList.add("p-0");
    paragraph.classList.add("m-0");
    paragraph.classList.add("flex-grow-1");
    paragraph.innerText = item;
    li.appendChild(paragraph)
    li.appendChild(createDeleteButton());
    return li;
}


function displayFacts(factlist) {
    let list = document.getElementById("factList");
    factlist.forEach((item)=>{
      let li = createFactli(item);
      list.appendChild(li);
    })
}


async function selectFacts() {
    const title = document.getElementById('title').value;
    const text = document.getElementById('paragraphbody').value;
    postParseFacts(title, text).then(
        data => displayFacts(data['facts'])
    );
}


function displayFinalParagraph(data) {
    const loadingllama = document.getElementById('loading')
    loadingllama.style.display = "none";
    const finalparagraph = data['paragraph'];
    let paragraphholder = document.getElementById("paragraphholder");
    paragraphholder.innerText = finalparagraph;
}


async function gptparagraphrequest() {
    const title = document.getElementById('title').value;
    const factarray = document.getElementsByTagName('li');
    const newfactarray = [];
    for (item of factarray) {newfactarray.push(item.firstChild.data)};
    const facts = newfactarray.join("\n")
    const loadingllama = document.getElementById('loading')
    loadingllama.style.display = "block";
    const tone = document.getElementById('paragraphtone').value
    return postFactsToParagraph(title, facts, tone)
}

async function writeParagraph() {
    gptparagraphrequest().then(
        data => displayFinalParagraph(data)
    );
}

function addUserFacts() {
    let list = document.getElementById("factList");
    let factinput = document.getElementById("newFact");
    let item = factinput.value;
    let li = createFactli(item);
    list.appendChild(li);
    factinput.value = "";
}


document.getElementById("userfactbutton").addEventListener('click',function(e){
   e.preventDefault(); // Cancel the native event
   e.stopPropagation();// Don't bubble/capture the event any further
});

function setProgressBar(progressbar, percent) {
    progressbar.style.width = String(percent) + "%" ;
    progressbar.setAttribute("aria-valuenow", String(percent));
}


function selectFactsForParagraph() {
    const factlist = document.getElementById("factList").children;
    const facts = []
    for (factelem of factlist) {
        facts.push(factelem.innerText)       
    }
    return facts
}


function getTopic() {
    let topic = document.getElementById('topic').value;
    if (topic === "") {
        topic = "Stede Bonnet";
        topic.value = "Stede Bonnet";
    }
    return topic
}


async function regenerateParagraph() {
    let spinner = document.getElementById("regenerateParagraphSpinner");
    spinner.hidden = false;
    const topic = getTopic()
    const tone = document.getElementById('paragraphtone').value;
    facts = selectFactsForParagraph();
    console.log(facts);
    const paragraph = await postFactsToParagraph(topic, facts, tone);
    displayFinalParagraph(paragraph);
    spinner.hidden = true;
}


function deleteFacts(){
    let ulelem = document.getElementById("factList");
    while (ulelem.lastElementChild) {
        ulelem.removeChild(ulelem.lastElementChild)
    };
}


async function  regenerateFacts() {
    let spinner = document.getElementById("regenerateFactsSpinner");
    spinner.hidden = false;
    const topic = getTopic();
    const tone = document.getElementById('paragraphtone').value;
    const url = document.getElementById('source-select').selectedOptions[0].value

    const article = await postScrapeArticle(url);

    // todo: if no response, list no reponse somewhere

    const facts = await postParseFacts(topic, article['article']['text']);
    deleteFacts();
    displayFacts(facts['facts']);
    spinner.hidden = true;
}


ignorelist = [
    'linkedin.com',
    'twitter.com'
]


function labelBadUrl(url) {
    let baddiv = document.getElementById("badurlsholder");
    baddiv.hidden = false;
    newp = document.createElement("p");
    newp.innerText = url;
    baddiv.appendChild(newp);
}


async function topicToParagraph() {
    const topic = getTopic();
    const tone = document.getElementById('paragraphtone').value;

    let progressbardiv = document.getElementById("paragraphwritingbar")
    progressbardiv.hidden = false;
    let progressbar = progressbardiv.children[0]

    setProgressBar(progressbar, 10);

    const res = await postFindSourceLinks(topic);
    let urls = [];

    setProgressBar(progressbar, 25);

    // make source section visable
    let sourceholder = document.getElementById("sourceholder");
    sourceholder.hidden = false;

    createSourceSelection(res);

    await res.forEach(function(element) { urls.push(element['url']) });

    for (url in urls) {
        var skip = false;
        for (item in ignorelist) {
            if (urls[url].includes(ignorelist[item])){
                skip = true;
            }
        }
        if (skip) {
            labelBadUrl(urls[url]);
            continue;
        }
        try {
            article = await postScrapeArticle(urls[url]);
            if (article['article']['text'].length > 100) {
                break;
            }
            labelBadUrl(urls[url]);
        } catch (error) {
            console.log("couldn't scrape url");
            console.log(urls[url]);
            labelBadUrl(urls[url]);
        }
    }

    console.log(article)
    document.getElementById("sourcetitle").innerText = article['article']['title'];
    let urlholder = document.getElementById("linkholder")
    urlholder.innerText = article['url'];
    urlholder.setAttribute("href", article['url']);

    highlightArticle(article);

    setProgressBar(progressbar, 50);

    const facts = await postParseFacts(topic, article['article']['text']);
    console.log(facts)
    displayFacts(facts['facts']);
    let sourcecard = document.getElementById("sourcecard")
    sourcecard.hidden = false;

    let sourceheader = document.getElementById("sourceheader");
    sourceheader.hidden = false;

    setProgressBar(progressbar, 75);

    const paragraph = await postFactsToParagraph(topic, facts['facts'], tone);
    displayFinalParagraph(paragraph);

    let paragraphdiv = document.getElementById("paragraphdiv");
    paragraphdiv.hidden = false;

    document.getElementById("newfactform").hidden = false;

    progressbardiv.hidden = true;
}

function testpostFindSourceLinks(topic) {
    return [
      {
        "title": "Llama - Wikipedia",
        "description": "The llama (Lama glama) is a domesticated South American camelid, widely used as a meat and pack animal by Andean cultures since the Pre-Columbian era. Llama.",
        "url": "https://en.wikipedia.org/wiki/Llama"
      },
      {
        "title": "Llama | National Geographic",
        "description": "These sturdy creatures are domestic animals used by the peoples of the Andes Mountains. (Their wild relatives are guanacos and vicuñas). Native peoples have ...",
        "url": "https://www.nationalgeographic.com/animals/mammals/facts/llama-1"
      },
      {
        "title": "llama | Description, Habitat, Diet, & Facts - Encyclopedia ...",
        "description": null,
        "url": "https://www.britannica.com/animal/llama"
      },
      {
        "title": "ADW: Lama glama: INFORMATION - Animal Diversity Web",
        "description": "Llamas are gregarious and highly social, living in groups of up to 20 individuals. · Llamas are also known to use communally shared locations (latrines) for ...",
        "url": "https://animaldiversity.org/accounts/Lama_glama/"
      },
      {
        "title": "Llama - Cosley Zoo",
        "description": "The llama is a long-necked mammal with thick fur and a stubby tail. Its face resembles that of a camel, with a rounded muzzle and a split ...",
        "url": "https://cosleyzoo.org/llama/"
      },
      {
        "title": "Llama - Denver Zoo",
        "description": "Llamas are close relatives of camels, but do not have humps. They have long necks and legs, relatively small heads with a split upper lip, large ears, and short ...",
        "url": "https://denverzoo.org/animals/llama/"
      },
      {
        "title": "Llamas and Alpacas - National Agricultural Library - USDA",
        "description": "National Sustainable Agriculture Information Service. \"Llamas or alpacas can be a good addition to a farm or ranch—an alternative livestock enterprise on ...",
        "url": "https://www.nal.usda.gov/legacy/afsic/llamas-and-alpacas"
      }
    ]
}

function testpostScrapeArticle(urls) {
    return {
          "article": {
            "title": "Llama",
            "text": "The llama ( ; Spanish pronunciation: [ˈʎama]) (Lama glama) is a domesticated South American camelid, widely used as a meat and pack animal by Andean cultures since the Pre-Columbian era. Llamas are social animals and live with others as a herd. Their wool is soft and contains only a small amount of lanolin.[2]..."
          },
          "url": "https://en.wikipedia.org/wiki/Llama"
        }
}


function testpostParseFacts(topic, text) {
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


function testpostFactsToParagraph(topic, facts, tone) {
    return {
        "paragraph": "Llamas are domesticated South American camelids that have been used as meat and pack animals by Andean cultures for centuries. They are social animals that live in herds, and their wool is soft and contains very little lanolin. Llamas can learn simple tasks quickly and can carry up to 30% of their body weight for long distances. The name \"llama\" was adopted by European settlers from native Peruvians. Llama ancestors are thought to have originated in North America and migrated to South America during the Great American Interchange. Camelids were extinct in North America by the end of the last ice age. As of 2007, there were over 7 million llamas and alpacas in South America.",
        "thowaway": null
    }
}


function testFactsPassThrough(data) {
    displayFacts(data['exampleFacts']);
}

function testFacts() {
    getExampleFacts().then(
        data => testFactsPassThrough(data)
    );
}
