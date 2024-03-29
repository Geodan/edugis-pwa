describe('empty spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:8000')
    //cy.pause()
    //document.querySelector("#app-container > map-app").shadowRoot.querySelector("web-map").shadowRoot.querySelector("#tools-menu > ul > li:nth-child(1) > map-iconbutton").shadowRoot.querySelector("div")
    const webMapShadow = cy.get('#app-container')
      .find('map-app')
      .shadow()
      .find('web-map')
      .shadow()

    webMapShadow.find('#tools-menu > ul > li:nth-child(1) > map-iconbutton')
      .click()
      //document.querySelector("#app-container > map-app").shadowRoot.querySelector("web-map").shadowRoot.querySelector("#panel-container > map-panel:nth-child(1) > map-search").shadowRoot.querySelector("div > input[type=text]")
    cy.get('#app-container')
      .find('map-app')
      .shadow()
      .find('web-map')
      .shadow()
      .find('#panel-container > map-panel:nth-child(1) > map-search')
      .shadow()
      .find('div > input[type=text]')
      .type('Wittenburgergracht 16, Amsterdam\n')
      //document.querySelector("#app-container > map-app").shadowRoot.querySelector("web-map").shadowRoot.querySelector("#panel-container > map-panel:nth-child(1) > map-search").shadowRoot.querySelector("div.resultlist > ul > li")
    cy.get('#app-container')
      .find('map-app')
      .shadow()
      .find('web-map')
      .shadow()
      .find('#panel-container > map-panel:nth-child(1) > map-search')
      .shadow()
      .find('div.resultlist > ul > li')
      .click()
    //document.querySelector("#app-container > map-app").shadowRoot.querySelector("web-map").shadowRoot.querySelector("div.webmap.maplibregl-map.mapboxgl-map > div.maplibregl-control-container.mapboxgl-control-container > div.maplibregl-ctrl-bottom-left.mapboxgl-ctrl-bottom-left > div.mapboxgl-ctrl.mapboxgl-ctrl-group.mapboxgl-ctrl-zoom > div > input[type=text]")
    cy.wait(8000)
    const zoomSetting = cy.get('#app-container')
      .find('map-app')
      .shadow()
      .find('web-map')
      .shadow()
      .find('div.webmap.maplibregl-map.mapboxgl-map > div.maplibregl-control-container.mapboxgl-control-container > div.maplibregl-ctrl-bottom-left.mapboxgl-ctrl-bottom-left > div.mapboxgl-ctrl.mapboxgl-ctrl-group.mapboxgl-ctrl-zoom > div > input[type=text]')
    
    zoomSetting.type('{selectall}10\n')
    cy.wait(2000)
    //document.querySelector("#app-container > map-app").shadowRoot.querySelector("web-map").shadowRoot.querySelector("map-coordinates")
    const mapCoords = cy.get('#app-container')
      .find('map-app')
      .shadow()
      .find('web-map')
      .shadow()
      .find('map-coordinates')
      .shadow()
    mapCoords.should('contain.text', '4.919')
    //document.querySelector("#app-container > map-app").shadowRoot.querySelector("web-map").shadowRoot.querySelector("#tools-menu > ul > li:nth-child(2) > map-iconbutton")
    cy.get('#app-container')
      .find('map-app')
      .shadow()
      .find('web-map')
      .shadow()
      .find('#tools-menu > ul > li:nth-child(2) > map-iconbutton')
      .click()
    //document.querySelector("#app-container > map-app").shadowRoot.querySelector("web-map").shadowRoot.querySelector("#panel-container > map-panel:nth-child(2) > map-data-catalog").shadowRoot.querySelector("map-layer-tree").shadowRoot.querySelector("div.wrapper > div > ul > li:nth-child(1)")
    cy.get('#app-container')
      .find('map-app')
      .shadow()
      .find('web-map')
      .shadow()
      .find('#panel-container > map-panel:nth-child(2) > map-data-catalog')
      .shadow()
      .find("map-layer-tree")
      .shadow()
      .find("div.wrapper > div > ul > li:nth-child(1)")
      .click()
    //document.querySelector("#app-container > map-app").shadowRoot.querySelector("web-map").shadowRoot.querySelector("#panel-container > map-panel:nth-child(2) > map-data-catalog").shadowRoot.querySelector("map-layer-tree").shadowRoot.querySelector("div.wrapper > div > ul > li:nth-child(1) > ul > li:nth-child(6)")
    cy.wait(1000)
    cy.get('#app-container')
      .find('map-app')
      .shadow()
      .find('web-map')
      .shadow()
      .find('#panel-container > map-panel:nth-child(2) > map-data-catalog')
      .shadow()
      .find("map-layer-tree")
      .shadow()
      .find("div.wrapper > div > ul > li:nth-child(1) > ul > li:nth-child(6)")
      .click()
    cy.wait(1000)
    //document.querySelector("#app-container > map-app").shadowRoot.querySelector("web-map").shadowRoot.querySelector("#panel-container > map-panel:nth-child(2) > map-data-catalog").shadowRoot.querySelector("map-layer-tree").shadowRoot.querySelector("div.wrapper > div > ul > li:nth-child(1) > ul > li:nth-child(6) > ul > li:nth-child(1)")
    cy.get('#app-container')
      .find('map-app')
      .shadow()
      .find('web-map')
      .shadow()
      .find('#panel-container > map-panel:nth-child(2) > map-data-catalog')
      .shadow()
      .find("map-layer-tree")
      .shadow()
      .find("div.wrapper > div > ul > li:nth-child(1) > ul > li:nth-child(6) > ul > li:nth-child(1)")
      .click()
    cy.wait(2000)
    //document.querySelector("#app-container > map-app").shadowRoot.querySelector("web-map").shadowRoot.querySelector("#legend-container-container > map-layer-container")
    cy.get('#app-container')
      .find('map-app')
      .shadow()
      .find('web-map')
      .shadow()
      .find("#legend-container-container > map-layer-container")
      .matchImage();
  })
})