function getHashParameters()
{
  const hash = location.hash.substr(1);
  return hash.split('&').reduce(function (result, item) {
    var parts = item.split('=');
    result[parts[0]] = parts[1];
    return result;
  }, {});
}

const result = getHashParameters();
if (result.helpstart) {
    setTimeout(()=>{
        var tour = {
            id: "hello-hopscotch",
            steps: [
                {
                    title: "Kaart",
                    content: "Je kunt van wereldwijd tot aan je eigen huis in- en uitzoomen en de kaart verslepen naar bijna elke plek op de wereld.",
                    target: document.querySelector("edugis-app").shadowRoot.querySelector('web-map').shadowRoot.querySelector('map-spinner'),
                    placement: "top"
                },
                {
                    title: "Gereedschappen",
                    content: "Met deze knoppen doe je bewerkingen op de kaart, houd de muis stil boven de knoppen voor meer uitleg over de knop",
                    target: document.querySelector("edugis-app").shadowRoot.querySelector('web-map').shadowRoot.querySelector('#tool-menu-container'),
                    placement: "right"
                },
                {
                    title: "Legenda",
                    content: "Hier komen de legenda's van de kaartlagen<br>De legenda van de achtergrondlaag is hier ook te vinden",
                    target: document.querySelector("edugis-app").shadowRoot.querySelector('web-map').shadowRoot.querySelector('map-selected-layers'),
                    placement: "left"
                }
            ]
          };
          // Start the tour!
          hopscotch.startTour(tour);
    }, 2000)
}


